import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Button, Row, Col, ControlLabel } from 'react-bootstrap';
import Loader from 'react-loader';
import _ from 'underscore';

import styles from './DataController.css';

import {
  dataApiToC3,
  parseTimeSeriesForC3,
  parseBootstrapTableData } from '../../core/util';
import {timeseriesToAnnualCycleGraph} from '../../core/chart';
import DataGraph from '../DataGraph/DataGraph';
import DataTable from '../DataTable/DataTable';
import Selector from '../Selector';
import TimeOfYearSelector from '../Selector/TimeOfYearSelector';
import DataControllerMixin from '../DataControllerMixin';

var DataController = React.createClass({

  propTypes: {
    model_id: React.PropTypes.string,
    variable_id: React.PropTypes.string,
    experiment: React.PropTypes.string,
    area: React.PropTypes.string,
    meta: React.PropTypes.array,
  },

  mixins: [DataControllerMixin],

  getInitialState: function () {
    return {
      projChangeTimeOfYear: 0,
      projChangeTimeScale: "monthly",
      dataTableTimeOfYear: 0,
      dataTableTimeScale: "monthly",
      timeSeriesRun: undefined,
      climoSeriesData: undefined,
      timeSeriesData: undefined,
      statsData: undefined,
    };
  },

  /*
   * Called when DataController is first loaded. Selects and fetches 
   * arbitrary initial data to display in the Projected Change graph, 
   * Annual Cycle Graph, and stats table. 
   * Monthly time resolution, January, on the first run returned by the API.
   */
  getData: function (props) {
    //load Annual Cycle graph - need monthly, seasonal, and yearly data
    this.setTimeSeriesNoDataMessage("Loading Data");
      
    var monthlyMetadata = _.findWhere(props.meta, {
      model_id: props.model_id,
      variable_id: props.variable_id,
      experiment: props.experiment,
      timescale: "monthly"});

    var seasonalMetadata = this.findMatchingMetadata(monthlyMetadata, {timescale: "seasonal"}, props.meta);
    var yearlyMetadata = this.findMatchingMetadata(monthlyMetadata, {timescale: "yearly"}, props.meta);
    
    var timeseriesPromises = [];
    
    //fetch data from the API for each time resolution that has a dataset. 
    //the "monthly" time resolution is guarenteed to exist, but
    //matching seasonal and yearly ones may not be in the database.
    _.each([monthlyMetadata, seasonalMetadata, yearlyMetadata], function(timeseries) {
      if(timeseries) {
        timeseriesPromises.push(this.getTimeseriesPromise(props, timeseries.unique_id));
      }
    }, this);

    Promise.all(timeseriesPromises).then(series => {
      var data = _.map(series, function(s) {return s.data});
      this.setState({
        timeSeriesData: timeseriesToAnnualCycleGraph(props.meta, ...data),
        timeSeriesRun: {
          start_date: monthlyMetadata.start_date,
          end_date: monthlyMetadata.end_date,
          ensemble_member: monthlyMetadata.ensemble_member
        },
      });
    }).catch(error => {
      this.displayError(error, this.setTimeSeriesNoDataMessage);
    });
    
    
    //load Projected Change graph
    this.setClimoSeriesNoDataMessage("Loading Data");
    var myDataPromise = this.getDataPromise(props, this.state.projChangeTimeScale, 
        this.state.projChangeTimeOfYear);

    myDataPromise.then(response => {
      this.setState({
        climoSeriesData: dataApiToC3(response.data),
      });
    }).catch(error => {
      this.displayError(error, this.setClimoSeriesNoDataMessage);
    });


    //load stats table
    this.setStatsTableNoDataMessage("Loading Data");
    var myStatsPromise = this.getStatsPromise(props, this.state.dataTableTimeOfYear);

    myStatsPromise.then(response => {
      //remove all results from datasets with the wrong timescale
      var stats = this.filterAPIResults(response.data, 
          {timescale: this.state.dataTableTimeScale}, props.meta);
      this.setState({
        statsData: parseBootstrapTableData(this.injectRunIntoStats(stats), props.meta),
      });
    }).catch(error => {
      this.displayError(error, this.setStatsTableNoDataMessage);
    });
  },

  //Removes all data from the Annual Cycle graph and displays a message
  setTimeSeriesNoDataMessage: function(message) {
    this.setState({
      timeSeriesData: { data: { columns: [], empty: { label: { text: message }, }, },
                        axis: {} },
      });
  },

  //Removes all data from the Projected Change graph and displays a message
  setClimoSeriesNoDataMessage: function(message) {
    this.setState({
      climoSeriesData: { data: { columns: [], empty: { label: { text: message }, }, },
                         axis: {} },
      });
  },

  //Removes all data from the Stats Table and displays a message
  setStatsTableNoDataMessage: function(message) {
    this.setState({
      statsTableOptions: { noDataText: message },
      statsData: [],
    });
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    // This guards against re-rendering before calls to the data sever alter the
    // state
     return JSON.stringify(nextState.climoSeriesData) !== JSON.stringify(this.state.climoSeriesData) ||
     JSON.stringify(nextState.statsData) !== JSON.stringify(this.state.statsData) ||
     JSON.stringify(nextState.timeSeriesData) !== JSON.stringify(this.state.timeSeriesData) ||
     JSON.stringify(nextProps.meta) !== JSON.stringify(this.props.meta) ||
     nextState.statsTableOptions !== this.state.statsTableOptions;
  },

  /*
   * Called when the user selects a time of year to display on the
   * Projected Change graph. Records the new time index and resolution
   * in state, fetches new data, and redraws the Projected Change graph.
   */
  updateProjChangeTimeOfYear: function (timeidx) {
    var idx = JSON.parse(timeidx).timeidx;
    var scale = JSON.parse(timeidx).timescale;
    this.setClimoSeriesNoDataMessage("Loading Data");
    this.setState({
      projChangeTimeOfYear: idx,
      projChangeTimeScale: scale,
    });
    this.getDataPromise(this.props, scale, idx).then(response => {
      this.setState({
        climoSeriesData: dataApiToC3(response.data),
      });
    }).catch(error => {
      this.displayError(error, this.setClimoSeriesNoDataMessage);
    });
  },

  /* 
   * Called when the user selects a time of year to display on the stats
   * table. Fetches new data, records the new time index and resolution
   * in state, and updates the table.
   */
  updateDataTableTimeOfYear: function (timeidx) {
    var idx = JSON.parse(timeidx).timeidx;
    var timescale = JSON.parse(timeidx).timescale;
    this.setStatsTableNoDataMessage("Loading Data");
    this.setState({
      dataTableTimeOfYear: idx,
      dataTableTimeScale: timescale,
    });
    this.getStatsPromise(this.props, idx).then(response => {
      var stats = this.filterAPIResults(response.data, {"timescale": timescale}, this.props.meta);
      this.setState({
        statsData: parseBootstrapTableData(this.injectRunIntoStats(stats), this.props.meta),
      });      
    }).catch(error => {
      this.displayError(error, this.setStatsTableNoDataMessage);
    });
  },

  /*
   * Called when the user selects a specific run to view on the Annual Cycle
   * graph. Stores the selected run and period in state, fetches new data,
   * and updates the graph.
   */
  updateAnnCycleDataset: function (run) {
    this.setTimeSeriesNoDataMessage("Loading Data");
    run = JSON.parse(run);
    this.setState({
      timeSeriesRun: run,
    });
    
    var runMetadata = {
        model_id: this.props.model_id,
        variable_id: this.props.variable_id,
        experiment: this.props.experiment,
        ensemble_member: run.ensemble_member,
        start_date: run.start_date,
        end_date: run.end_date,
        timescale: "other" };
    
    var monthlyMetadata = this.findMatchingMetadata(runMetadata, {timescale: "monthly"});
    
    var seasonalMetadata = this.findMatchingMetadata(runMetadata, {timescale:"seasonal"});
    
    var yearlyMetadata = this.findMatchingMetadata(runMetadata, {timescale: "yearly"});
        
    //fetch data from the API for each time resolution that has a dataset. 
    //At least one dataset for this model + experiment + variable + period + ensemble member 
    //combination must exist in the database (otherwise there wouldn't be an entry
    //in the dropdown), but it may be monthly, seasonal, or yearly.
    //(Ideally one of each, but not guarenteed.)
    var timeseriesPromises = [];

    _.each([monthlyMetadata, seasonalMetadata, yearlyMetadata], function(timeseries) {
      if(timeseries) {
        timeseriesPromises.push(this.getTimeseriesPromise(this.props, timeseries.unique_id));
      }
    }, this);
    
    //fetch data and generate graph
    Promise.all(timeseriesPromises).then(series => {
      var data = _.map(series, function(s) {return s.data});
      this.setState({
        timeSeriesData: timeseriesToAnnualCycleGraph([monthlyMetadata, seasonalMetadata, yearlyMetadata], ...data)
        });
    }).catch(error => {
      this.displayError(error, this.setTimeSeriesNoDataMessage);
    });    
  },

  render: function () {
    var climoSeriesData = this.state.climoSeriesData ? this.state.climoSeriesData : { data: { columns: [] }, axis: {} };
    var timeSeriesData = this.state.timeSeriesData ? this.state.timeSeriesData : { data: { columns: [] }, axis: {} };
    var statsData = this.state.statsData ? this.state.statsData : [];
    
    //make a list of all the unique combinations of run + climatological period
    //a user could decide to view.
    //Not sure JSON is the right way to do this, though.
    //TODO: see if there's a more elegant way to handle the callback
    var ids = this.props.meta.map(function (el) {
        return [JSON.stringify(_.pick(el, 'start_date', 'end_date', 'ensemble_member')),
            `${el.ensemble_member} ${el.start_date}-${el.end_date}`];
    });
    ids = _.uniq(ids, false, function(item){return item[1]});

    return (
      <div>
        <h3>{this.props.model_id + ' ' + this.props.variable_id + ' ' + this.props.experiment}</h3>
        <Tabs>
          <TabList>
            <Tab>Annual Cycle</Tab>
            <Tab>Projected Change</Tab>
          </TabList>
          <TabPanel>
            <Row>
              <Col lg={4} lgPush={8} md={6} mdPush={6} sm={6} smPush={6}>
                <Selector label={"Dataset"} onChange={this.updateAnnCycleDataset} items={ids} />
              </Col>
              <Col lg={4} lgPush={1} md={6} mdPush={1} sm={6} smPush={1}>
                <div>
                  <ControlLabel className={styles.exportlabel}>Download Data</ControlLabel>
                  <Button onClick={this.exportTimeSeries.bind(this, 'xlsx')}>XLSX</Button>
                  <Button onClick={this.exportTimeSeries.bind(this, 'csv')}>CSV</Button>
                </div>
              </Col>
            </Row>
            <DataGraph data={timeSeriesData.data} axis={timeSeriesData.axis} tooltip={timeSeriesData.tooltip} />
          </TabPanel>
          <TabPanel>
            <Row>
              <Col lg={4} lgPush={8} md={6} mdPush={6} sm={6} smPush={6}>
                <TimeOfYearSelector onChange={this.updateProjChangeTimeOfYear} />
              </Col>
              <Col>
                <div>
                  <ControlLabel className={styles.exportlabel}>Download Data</ControlLabel>
                  <Button onClick={this.exportClimoSeries.bind(this, 'xlsx')}>XLSX</Button>
                  <Button onClick={this.exportClimoSeries.bind(this, 'csv')}>CSV</Button>
                </div>
              </Col>
            </Row>
            <DataGraph data={climoSeriesData.data} axis={climoSeriesData.axis} tooltip={climoSeriesData.tooltip} />
          </TabPanel>
        </Tabs>
        <Row>
          <Col lg={4} lgPush={8} md={6} mdPush={6} sm={6} smPush={6}>
            <TimeOfYearSelector onChange={this.updateDataTableTimeOfYear} />
          </Col>
        </Row>
        <DataTable data={statsData}  options={this.state.statsTableOptions}/>
        <div style={{ marginTop: '10px' }}>
          <Button style={{ marginRight: '10px' }} onClick={this.exportDataTable.bind(this, 'xlsx')}>Export To XLSX</Button>
          <Button onClick={this.exportDataTable.bind(this, 'csv')}>Export To CSV</Button>
        </div>
      </div>
    );
  },
});

export default DataController;

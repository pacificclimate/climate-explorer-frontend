/*******************************************************************
 * DataController.js - controller component for in-depth numerical
 * visualization
 * 
 * Receives a model, an experiment, and a variable from its parent,
 * AppController. Presents the user with widgets to allow selection 
 * of a particular slice of data (time of year or run) and download 
 * of selected data. 
 * 
 * Queries the API to retrieve the selected data generates graphs and
 * tables from it as viewing components:
 * - a DataTable with statistics about each qualifying run 
 * - an annual cycle DataGraph with monthly, seasonal, and annual lines
 *   (climatologies only)
 * - a long term average DataGraph with each run displayed separately
 *   (climatologies only)
 * - a time series Datagraph that shows every point
 *   (point in time datasets only)
 *******************************************************************/

import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Button, Row, Col, ControlLabel } from 'react-bootstrap';
import Loader from 'react-loader';
import _ from 'underscore';

import styles from './DataController.css';

import { parseBootstrapTableData } from '../../core/util';
import {timeseriesToAnnualCycleGraph,
        dataToLongTermAverageGraph,
        timeseriesToTimeSeriesGraph} from '../../core/chart';
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
      longTermAverageTimeOfYear: 0,
      longTermAverageTimeScale: "monthly",
      dataTableTimeOfYear: 0,
      dataTableTimeScale: "monthly",
      annualCycleInstance: undefined,
      longTermAverageData: undefined,
      annualCycleData: undefined,
      timeseriesData: undefined,
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
    //if the selected dataset is a multi-year mean, load annual cycle
    //and projected change graphs, otherwise load the timeseries graph
    if(this.multiYearMeanSelected(props)) {
      this.loadAnnualCycleGraph(props);
      this.loadLongTermAverageGraph(props);
    }
    else {
      this.loadTimeSeriesGraph(props);
    }
    this.loadDataTable(props);
  },

  //Removes all data from the Annual Cycle graph and displays a message
  setAnnualCycleGraphNoDataMessage: function(message) {
    this.setState({
      annualCycleData: { data: { columns: [], empty: { label: { text: message }, }, },
                        axis: {} },
      });
  },

  //Removes all data from the Long Term Average graph and displays a message
  setLongTermAverageGraphNoDataMessage: function(message) {
    this.setState({
      longTermAverageData: { data: { columns: [], empty: { label: { text: message }, }, },
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

  //Removes all data from the Timeseries Graph and displays a message
  setTimeSeriesGraphNoDataMessage: function(message) {
    this.setState({
      timeSeriesData: { data: { columns: [], empty: { label: { text: message }, }, },
                         axis: {} },
      });
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    // This guards against re-rendering before calls to the data sever alter the
    // state
     return !(_.isEqual(nextState.longTermAverageData, this.state.longTermAverageData) &&
     _.isEqual(nextState.statsData, this.state.statsData) &&
     _.isEqual(nextState.annualCycleData, this.state.annualCycleData) &&
     _.isEqual(nextState.timeSeriesData, this.state.timeSeriesData) &&
     _.isEqual(nextProps.meta, this.props.meta) &&
     _.isEqual(nextState.statsTableOptions, this.state.statsTableOptions));
  },

  /*
   * Called when the user selects a time of year to display on the
   * Long Term Average graph. Records the new time index and resolution
   * in state, fetches new data, and redraws the Projected Change graph.
   */
  updateLongTermAverageTimeOfYear: function (timeidx) {
    this.loadLongTermAverageGraph(this.props, JSON.parse(timeidx));
  },

  /* 
   * Called when the user selects a time of year to display on the stats
   * table. Fetches new data, records the new time index and resolution
   * in state, and updates the table.
   */
  updateDataTableTimeOfYear: function (timeidx) {
    this.loadDataTable(this.props, JSON.parse(timeidx));
    },

  /*
   * Called when the user selects a specific instance (period & run) to 
   * view on the Annual Cycle graph. Stores the selected run and period in state, 
   * fetches new data, and updates the graph.
   */
  updateAnnualCycleDataset: function (instance) {
    this.loadAnnualCycleGraph(this.props, JSON.parse(instance));
  },
  
  /*
   * This function retrieves fetches monthly, seasonal, and yearly resolution
   * annual cycle data and displays them on the graph. If instance (an object 
   * with start_date, end_date, and ensemble_member attributes) is provided, data
   * matching those parameters will be selected; otherwise an arbitrary set 
   * of data matching the other parameters.
   */
  loadAnnualCycleGraph: function (props, instance) {
    //load Annual Cycle graph - need monthly, seasonal, and yearly data
    this.setAnnualCycleGraphNoDataMessage("Loading Data");
    
    var params = _.pick(props, 'model_id', 'variable_id', 'experiment');
    params.timescale = "monthly";
    
    if(instance) {
      _.extend(params, instance);
    }
    
    var monthlyMetadata = _.findWhere(props.meta, params);

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
      var data = _.pluck(series, "data");
      this.setState({
        timeSeriesData: timeseriesToAnnualCycleGraph(props.meta, ...data),
        timeSeriesInstance: {
          start_date: monthlyMetadata.start_date,
          end_date: monthlyMetadata.end_date,
          ensemble_member: monthlyMetadata.ensemble_member
        },
      });
    }).catch(error => {
      this.displayError(error, this.setAnnualCycleGraphNoDataMessage);
    });    
  },
  
  /*
   * This function fetches and loads data  for the Long Term Average graphs.
   * If passed a time of year(resolution and index), it will load
   * data for that time of year. Otherwise, it defaults to January 
   * (resolution: "monthly", index 0).
   */
  loadLongTermAverageGraph: function (props, time) {
    var timescale = time ? time.timescale : this.state.longTermAverageTimeScale;
    var timeidx = time ? time.timeidx : this.state.longTermAverageTimeOfYear;
    
    this.setLongTermAverageGraphNoDataMessage("Loading Data");
    var myDataPromise = this.getDataPromise(props, timescale, timeidx);

    myDataPromise.then(response => {      
      this.setState({
        longTermAverageTimeOfYear: timeidx,
        longTermAverageTimeScale: timescale,
        longTermAverageData: dataToLongTermAverageGraph([response.data]),
      });
    }).catch(error => {
      this.displayError(error, this.setLongTermAverageGraphNoDataMessage);
    });
  },
  
  /*
   * This function fetches and loads data for the Timeseries graph.
   * As the Timeseries graph shows all data points at once, there's no
   * filtering or selection done by this function.
   */
  loadTimeSeries: function(props) {

    this.setTimeSeriesGraphNoDataMessage("Loading Data");

    var params = _.pick(props, 'model_id', 'variable_id', 'experiment');

    var metadata = _.findWhere(props.meta, params);

    var timeSeriesPromise = this.getTimeseriesPromise(props, metadata.unique_id);
    timeSeriesPromise.then(response => {
      this.setState({
        timeSeriesData: timeseriesToTimeSeriesGraph(props.meta, response.data)
      });
    }).catch(error => {
      this.displayError(error, this.setTimeSeriesGraphNoDataMessage);
    });
  },

  /*
   * This function fetches and loads data for the Stats Table. 
   * If passed a time of year(resolution and index), it will load
   * data for that time of year. Otherwise, it defaults to January 
   * (resolution: "monthly", index 0). 
   */
  loadDataTable: function (props, time) {
    
    var timeidx = time ? time.timeidx : this.state.dataTableTimeOfYear;
    var timeres = time ? time.timescale : this.state.dataTableTimeScale;
        
    //load stats table
    this.setStatsTableNoDataMessage("Loading Data");
    var myStatsPromise = this.getStatsPromise(props, timeidx);

    myStatsPromise.then(response => {
      //remove all results from datasets with the wrong timescale
      var stats = this.filterAPIResults(response.data, 
          {timescale: timeres}, props.meta);
      this.setState({
        dataTableTimeOfYear: timeidx,
        dataTableTimeScale: timeres,
        statsData: parseBootstrapTableData(this.injectRunIntoStats(stats), props.meta),
      });
    }).catch(error => {
      this.displayError(error, this.setStatsTableNoDataMessage);
    });

  },

  render: function () {
    var longTermAverageData = this.state.longTermAverageData ? this.state.longTermAverageData : { data: { columns: [] }, axis: {} };
    var annualCycleData = this.state.annualCycleData ? this.state.annualCycleData : { data: { columns: [] }, axis: {} };
    var statsData = this.state.statsData ? this.state.statsData : [];
    var timeSeriesData = this.state.timeSeriesData ? this.state.timeSeriesData : { data: { columns: [] }, axis: {} };

    //make a list of all the unique combinations of run + climatological period
    //a user could decide to view.
    //Not sure JSON is the right way to do this, though.
    //TODO: see if there's a more elegant way to handle the callback
    var ids = this.props.meta.map(function (el) {
        return [JSON.stringify(_.pick(el, 'start_date', 'end_date', 'ensemble_member')),
            `${el.ensemble_member} ${el.start_date}-${el.end_date}`];
    });
    ids = _.uniq(ids, false, function(item){return item[1]});

    var selectedInstance;
    _.each(ids, id => {
      if(_.isEqual(JSON.parse(id[0]), this.state.annualCycleInstance)) {
        selectedInstance = id[0];
      }
    });

    var annualTab, longTermTab, timeseriesTab, annualTabPanel, longTermTabPanel, timeseriesTabPanel;
    if(this.multiYearMeanSelected()) {
      //Annual Cycle Graph
      annualTab = (<Tab>Annual Cycle</Tab>);
      annualTabPanel = (
          <TabPanel>
          <Row>
            <Col lg={4} lgPush={8} md={6} mdPush={6} sm={6} smPush={6}>
              <Selector label={"Dataset"} onChange={this.updateAnnualCycleDataset} items={ids} value={selectedInstance}/>
            </Col>
            <Col lg={4} lgPush={1} md={6} mdPush={1} sm={6} smPush={1}>
              <div>
                <ControlLabel className={styles.exportlabel}>Download Data</ControlLabel>
                <Button onClick={this.exportAnnualCycle.bind(this, 'xlsx')}>XLSX</Button>
                <Button onClick={this.exportAnnualCycle.bind(this, 'csv')}>CSV</Button>
              </div>
            </Col>
          </Row>
          <DataGraph data={annualCycleData.data} axis={annualCycleData.axis} tooltip={annualCycleData.tooltip} />
        </TabPanel>
        );

      //Projected Change Graph
      longTermTab = (<Tab>Long Term Averages</Tab>);
      longTermTabPanel = (
          <TabPanel>
          <Row>
            <Col lg={4} lgPush={8} md={6} mdPush={6} sm={6} smPush={6}>
              <TimeOfYearSelector onChange={this.updateLongTermAverageTimeOfYear} />
            </Col>
            <Col>
              <div>
                <ControlLabel className={styles.exportlabel}>Download Data</ControlLabel>
                <Button onClick={this.exportLongTermAverage.bind(this, 'xlsx')}>XLSX</Button>
                <Button onClick={this.exportLongTermAverage.bind(this, 'csv')}>CSV</Button>
              </div>
            </Col>
          </Row>
          <DataGraph data={longTermAverageData.data} axis={longTermAverageData.axis} tooltip={longTermAverageData.tooltip} />
        </TabPanel>
        );
    }
    else {
      //Time Series Graph
      timeseriesTab = (<Tab>Time Series</Tab>);
      timeseriesTabPanel = (
        <TabPanel>
          <DataGraph data={timeseriesData.data} axis={timeseriesData.axis} tooltip={timeseriesData.tooltip} subchart={timeseriesData.subchart} />
          <ControlLabel className={styles.graphlabel}>Highlight a time span on lower graph to see more detail</ControlLabel>
        </TabPanel>  
      );
    }

    return (
      <div>
        <h3>{this.props.model_id + ' ' + this.props.variable_id + ' ' + this.props.experiment}</h3>
        <Tabs>
          <TabList>
            {annualTab}
            {longTermTab}
            {timeseriesTab}
          </TabList>
          {annualTabPanel}
          {longTermTabPanel}
          {timeseriesTabPanel}
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

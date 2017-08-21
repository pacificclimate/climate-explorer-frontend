/*******************************************************************
 * DataController.js - controller component for in-depth numerical
 * visualization
 * 
 * Receives a model, an experiment, and a variable from its parent,
 * AppController. Presents the user with widgets to allow selection 
 * of a particular slice of data (time of year or run) and download 
 * of selected data. 
 * 
 * Queries the API to retrieve the selected data and controls three 
 * viewing components: 
 * - a DataTable with statistics about each qualifying run 
 * - an annual cycle DataGraph with monthly, seasonal, and annual lines 
 * - a projected change DataGraph with each run displayed separately
 *******************************************************************/

import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Button, Row, Col, ControlLabel } from 'react-bootstrap';
import Loader from 'react-loader';
import _ from 'underscore';

import styles from './DataController.css';

import { parseBootstrapTableData } from '../../core/util';
import {timeseriesToAnnualCycleGraph,
        dataToProjectedChangeGraph} from '../../core/chart';
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
    this.loadTimeSeries(props);
    this.loadClimoSeries(props);
    this.loadDataTable(props);
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
     return !(_.isEqual(nextState.climoSeriesData, this.state.climoSeriesData) &&
     _.isEqual(nextState.statsData, this.state.statsData) &&
     _.isEqual(nextState.timeSeriesData, this.state.timeSeriesData) &&
     _.isEquald(nextProps.meta, this.props.meta) &&
     _.isEqual(nextState.statsTableOptions, this.state.statsTableOptions));
  },

  /*
   * Called when the user selects a time of year to display on the
   * Projected Change graph. Records the new time index and resolution
   * in state, fetches new data, and redraws the Projected Change graph.
   */
  updateProjChangeTimeOfYear: function (timeidx) {
    this.loadClimoSeries(this.props, JSON.parse(timeidx));
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
   * Called when the user selects a specific run to view on the Annual Cycle
   * graph. Stores the selected run and period in state, fetches new data,
   * and updates the graph.
   */
  updateAnnCycleDataset: function (run) {
    this.loadTimeSeries(this.props, JSON.parse(run));
  },
  
  /*
   * This function retrieves fetches monthly, seasonal, and yearly resolution
   * annual cycle data and displays them on the graph. If run (an object with 
   * start_date, end_date, and ensemble_member attributes) is provided, data
   * matching those parameters will be selected; otherwise an arbitrary set 
   * of data matching the other parameters.
   */
  loadTimeSeries: function (props, run) {
    //load Annual Cycle graph - need monthly, seasonal, and yearly data
    this.setTimeSeriesNoDataMessage("Loading Data");
    
    var params = _.pick(props, 'model_id', 'variable_id', 'experiment');
    params.timescale = "monthly";
    
    if(run) {
      _.extend(params, run);
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
        timeSeriesRun: {
          start_date: monthlyMetadata.start_date,
          end_date: monthlyMetadata.end_date,
          ensemble_member: monthlyMetadata.ensemble_member
        },
      });
    }).catch(error => {
      this.displayError(error, this.setTimeSeriesNoDataMessage);
    });    
  },
  
  /*
   * This function fetches and loads data  for the Projected Change graphs.
   * If passed a time of year(resolution and index), it will load
   * data for that time of year. Otherwise, it defaults to January 
   * (resolution: "monthly", index 0).
   */
  loadClimoSeries: function (props, time) {
    var timescale = time ? time.timescale : this.state.projChangeTimeScale;
    var timeidx = time ? time.timeidx : this.state.projChangeTimeOfYear;
    
    this.setClimoSeriesNoDataMessage("Loading Data");
    var myDataPromise = this.getDataPromise(props, timescale, timeidx);

    myDataPromise.then(response => {      
      this.setState({
        projChangeTimeOfYear: timeidx,
        projChangeTimeScale: timescale,
        climoSeriesData: dataToProjectedChangeGraph([response.data]),
      });
    }).catch(error => {
      this.displayError(error, this.setClimoSeriesNoDataMessage);
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

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
 * tables from it as viewing components. 
 *
 * If the selected dataset is a multi year mean climatology:
 *  - an Annual Cycle Datagraph with monthly, seasonal, and annual
 *    resolution (if available)
 * 
 *  - a Long Term Average Datagraph showing the mean of each climatology
 *    period as a seperate data point.
 *
 *  - a Model Context Datagraph similar to the Long Term Average
 *    Datagraph, but with a separate line for each model.
 *
 * If the selected dataset is not a multi year mean:
 *  - a Time Series Datagraph showing each time point available.
 *
 *  - a Model Context datagraph similar to the Time Series Datagraph,
 *    but showing data for each model.
 *
 * A Data Table viewer component showing statistical information for each
 * climatology period or timeseries is also generated. 
 *******************************************************************/

import PropTypes from 'prop-types';

import React from 'react';
import createReactClass from 'create-react-class';
import { Button, Row, Col, ControlLabel, Tab, Tabs } from 'react-bootstrap';
import Loader from 'react-loader';
import _ from 'underscore';

import styles from './DataController.css';

import { parseBootstrapTableData,
         timeResolutionIndexToTimeOfYear,
         timeKeyToResolutionIndex,
         resolutionIndexToTimeKey} from '../../core/util';
import {timeseriesToAnnualCycleGraph,
        dataToLongTermAverageGraph,
        timeseriesToTimeseriesGraph,
        assignColoursByGroup,
        fadeSeriesByRank,
        hideSeriesInLegend} from '../../core/chart';
import DataGraph from '../DataGraph/DataGraph';
import DataTable from '../DataTable/DataTable';
import Selector from '../Selector';
import TimeOfYearSelector from '../Selector/TimeOfYearSelector';
import DataControllerMixin from '../DataControllerMixin';

var DataController = createReactClass({
  displayName: 'DataController',

  propTypes: {
    model_id: PropTypes.string,
    variable_id: PropTypes.string,
    experiment: PropTypes.string,
    area: PropTypes.string,
    meta: PropTypes.array,
    ensemble_name: PropTypes.string,
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
      contextData: undefined
    };
  },

  /*
   * Called when DataController is first loaded. Selects and fetches 
   * arbitrary initial data to display in the graphs and stats table. 
   * Monthly time resolution, January, on the first run returned by the API.
   */
  getData: function (props) {
    //if the selected dataset is a multi-year mean, load annual cycle
    //and long term average graphs, otherwise load a timeseries graph
    if(this.multiYearMeanSelected(props)) {
      this.loadAnnualCycleGraph(props);
      this.loadLongTermAverageGraph(props);
      this.loadDataTable(props);
      this.loadContextGraph(props);
    }
    else {
      this.loadTimeseriesGraph(props);
      this.loadDataTable(props, {timeidx: 0, timescale: "yearly"});
      this.loadContextGraph(props);
    }
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

  //Removes all data from the Context Graph and displays a message
  setContextGraphNoDataMessage: function(message) {
    this.setState({
      contextData: { data: { columns: [], empty: { label: { text: message }, }, },
        axis: {} },
    });
  },

  //Removes all data from the Timeseries Graph and displays a message
  setTimeseriesGraphNoDataMessage: function(message) {
    this.setState({
      timeseriesData: { data: { columns: [], empty: { label: { text: message }, }, },
                         axis: {} },
      });
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    // This guards against re-rendering before calls to the data sever alter the
    // state
     return !(_.isEqual(nextState.longTermAverageData, this.state.longTermAverageData) &&
     _.isEqual(nextState.statsData, this.state.statsData) &&
     _.isEqual(nextState.annualCycleData, this.state.annualCycleData) &&
     _.isEqual(nextState.timeseriesData, this.state.timeseriesData) &&
     _.isEqual(nextState.contextData, this.state.contextData) &&
     _.isEqual(nextProps.meta, this.props.meta) &&
     _.isEqual(nextState.statsTableOptions, this.state.statsTableOptions));
  },

  /*
   * Called when the user selects a time of year to display on the
   * Long Term Average graph. Records the new time index and resolution
   * in state, fetches new data, and redraws the Long Term Average graph.
   */
  updateLongTermAverageTimeOfYear: function (timeidx) {
    this.loadLongTermAverageGraph(this.props, timeKeyToResolutionIndex(timeidx));
  },

  /* 
   * Called when the user selects a time of year to display on the stats
   * table. Fetches new data, records the new time index and resolution
   * in state, and updates the table.
   */
  updateDataTableTimeOfYear: function (timeidx) {
    this.loadDataTable(this.props, timeKeyToResolutionIndex(timeidx));
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
        annualCycleData: timeseriesToAnnualCycleGraph(props.meta, ...data),
        annualCycleInstance: {
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
  loadTimeseriesGraph: function(props) {

    this.setTimeseriesGraphNoDataMessage("Loading Data");

    var params = _.pick(props, 'model_id', 'variable_id', 'experiment');

    var metadata = _.findWhere(props.meta, params);

    var timeseriesPromise = this.getTimeseriesPromise(props, metadata.unique_id);
    timeseriesPromise.then(response => {
      this.setState({
        timeseriesData: timeseriesToTimeseriesGraph(props.meta, response.data)
      });
    }).catch(error => {
      this.displayError(error, this.setTimeseriesGraphNoDataMessage);
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
      if(_.allKeys(stats).length > 0) {
        this.setState({
          dataTableTimeOfYear: timeidx,
          dataTableTimeScale: timeres,
          statsData: parseBootstrapTableData(this.injectRunIntoStats(stats), props.meta),
        });
      }
      else {
        this.setState({
          dataTableTimeOfYear: timeidx,
          dataTableTimeScale: timeres,
        });
        this.setStatsTableNoDataMessage("Statistics unavailable for this time period.");
      }
    }).catch(error => {
      this.displayError(error, this.setStatsTableNoDataMessage);
    });
  },

  /*
   * This function fetches and loads data for the Context Graph
   * comparing several models. Multi-year-mean and nominal time
   * datasets are accessed by different API endpoints; this function
   * will use the relevant query, then postprocess the graph.
   */
  loadContextGraph: function (props) {
    this.setContextGraphNoDataMessage("Loading Data");

    var graph = this.blankGraph;

    //helper function to postprocesses a generated graph to make
    //the currently selected model visually distinguishable from all the
    //other models. "Context" models are assigned a shared colour,
    //faded, and hidden from the legend.
    var distinguishSelectedModel = function (graph) {

      //segmentor helper function used to distinguish selected model from all others
      var makeModelSegmentor = function (selectedModelOutput, otherModelOutput) {
        return function(dataseries) {
          return dataseries[0].search(props.model_id) != -1 ? selectedModelOutput : otherModelOutput;
        }
      };

      graph = assignColoursByGroup(graph, makeModelSegmentor(1, 0));
      graph = fadeSeriesByRank(graph, makeModelSegmentor(1, .35));
      graph = hideSeriesInLegend(graph, makeModelSegmentor(false, true));

      //simplify graph by turning off tooltip and missing data gaps
      graph.line.connectNull = true;
      graph.tooltip = {show: false};

      return graph;
    };

    if(this.multiYearMeanSelected(props)) {
      //multi year means use the "data" API endpoint
      var dataPromises = [];
      var dataQueryParams = [];
      var contextModels = _.without(_.uniq(_.pluck(props.contextMeta, "model_id")), props.model_id);
      var params = _.pick(props, 'experiment', 'variable_id', "ensemble_name");
      params.timescale = 'yearly';
      params.multi_year_mean = true;

      //determine which models have data that matches this variable and experiment
      for(let i = 0; i < contextModels.length; i++ ) {
        params.model_id = contextModels[i];
        if(_.where(props.contextMeta, params)){
          dataPromises.push(this.getDataPromise(params, "yearly", 0));
          dataQueryParams.push(_.extend({}, params));
        }
      }

      //add the selected model last, so it stands out
      params.model_id = props.model_id;
      dataPromises.push(this.getDataPromise(params, "yearly", 0));
      dataQueryParams.push(_.extend({}, params));

      //fetch data from the backend and assemble the graph
      Promise.all(dataPromises).then(responses=> {
        var data = _.pluck(responses, "data");
        graph = dataToLongTermAverageGraph(data, dataQueryParams);

        graph = distinguishSelectedModel(graph);

        this.setState({
          contextData: graph
        });
      }).catch(error => {
        this.displayError(error, this.setContextGraphNoDataMessage);
      });
    } else {
      //Non-multi-year-means use the "timeseries" API endpoint
      //Collect metadata for all datasets that can be compared to the selected one.
      var params = _.pick(props, 'variable_id', 'experiment');
      params.multi_year_mean = false;
      params.timescale = "yearly";
      var selected = _.where(props.contextMeta, params);

      //query the backend about all relevant datasets
      var timeseriesPromises = [];

      for(let i = 0; i < selected.length; i++) {
        params.model_id = selected[i].model_id;
        timeseriesPromises.push(this.getTimeseriesPromise(params, selected[i].unique_id));
      }

      //generate graph
      Promise.all(timeseriesPromises).then(responses => {
        var data = _.pluck(responses, "data");

        //move data associated with the selected model to the end of the data array
        //so it's maximally visible when graphed.
        data.sort(result => {return result.id.search(props.model_id);});

        graph = timeseriesToTimeseriesGraph(selected, ...data);
        graph = distinguishSelectedModel(graph);
        this.setState({
          contextData: graph
        });
      }).catch(error => {
        this.displayError(error, this.setContextGraphNoDataMessage);
      });
    }
  },

  render: function () {
    var longTermAverageData = this.state.longTermAverageData ? this.state.longTermAverageData : this.blankGraph;
    var annualCycleData = this.state.annualCycleData ? this.state.annualCycleData : this.blankGraph;
    var statsData = this.state.statsData ? this.state.statsData : [];
    var timeseriesData = this.state.timeseriesData ? this.state.timeseriesData : this.blankGraph;

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

    var dataTableSelected = resolutionIndexToTimeKey(this.state.dataTableTimeScale,
      this.state.dataTableTimeOfYear);

    var annualTab = null, longTermTab = null, timeseriesTab = null;
    if (this.multiYearMeanSelected()) {
      // Annual Cycle Graph
      annualTab = (
        <Tab eventKey={1} title='Annual Cycle'>
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
        </Tab>
      );

      // Long Term Average Graph
      longTermTab = (
        <Tab eventKey={2} title='Long Term Averages'>
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
        </Tab>
      );
    } else {
      // Time Series Graph
      timeseriesTab = (
        <Tab eventKey={3} title='Time Series'>
          <DataGraph data={timeseriesData.data} axis={timeseriesData.axis} tooltip={timeseriesData.tooltip} subchart={timeseriesData.subchart} />
          <ControlLabel className={styles.graphlabel}>Highlight a time span on lower graph to see more detail</ControlLabel>
        </Tab>
      );
    }

    var contextData = this.state.contextData ? this.state.contextData : this.blankGraph;
    var contextTab = (
        <Tab> eventKey={3} title='Model Context'>
          <DataGraph
            data={contextData.data}
            axis={contextData.axis}
            legend={contextData.legend}
            line={contextData.line}
            tooltip={contextData.tooltip}
          />
        </Tab>
    );

    return (
      <div>
        <h3>{this.props.model_id + ' ' + this.props.variable_id + ' ' + this.props.experiment}</h3>
        <Tabs>
          {annualTab}
          {longTermTab}
          {timeseriesTab}
          {contextTab}
        </Tabs>
        <Row>
          <Col lg={4} lgPush={8} md={6} mdPush={6} sm={6} smPush={6}>
            <TimeOfYearSelector onChange={this.updateDataTableTimeOfYear} value={dataTableSelected} />
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
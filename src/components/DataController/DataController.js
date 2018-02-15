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
 * A Data Table viewer component showing statistical information for each
 * climatology period or timeseries is also generated. 
 *******************************************************************/

import PropTypes from 'prop-types';

import React from 'react';
import createReactClass from 'create-react-class';
import { Button, Row, Col, Tab, Tabs } from 'react-bootstrap';
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
        hideSeriesInLegend,
        sortSeriesByRank} from '../../core/chart';
import DataTable from '../DataTable/DataTable';
import TimeOfYearSelector from '../Selector/TimeOfYearSelector';
import DataControllerMixin from '../DataControllerMixin';
import AnnualCycleGraph from '../graphs/AnnualCycleGraph';
import LongTermAveragesGraph from '../graphs/LongTermAveragesGraph';
import ContextGraph from '../graphs/ContextGraph';
import TimeSeriesGraph from '../graphs/TimeSeriesGraph';
import {findMatchingMetadata} from "../graphs/graph-helpers";

var DataController = createReactClass({
  displayName: 'DataController',

  propTypes: {
    model_id: PropTypes.string,
    variable_id: PropTypes.string,
    experiment: PropTypes.string,
    area: PropTypes.string,
    meta: PropTypes.array,
    contextMeta: PropTypes.array,
    ensemble_name: PropTypes.string,
  },

  mixins: [DataControllerMixin],

  getInitialState: function () {
    return {
      longTermAverageTimeOfYear: 0,
      longTermAverageTimeScale: "monthly",
      dataTableTimeOfYear: 0,
      dataTableTimeScale: "monthly",
      longTermAverageData: undefined,
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
      // this.loadLongTermAverageGraph(props);
      this.loadDataTable(props);
      this.loadContextGraph(props);
    }
    else {
      this.loadTimeseriesGraph(props);
      this.loadDataTable(props, {timeidx: 0, timescale: "yearly"});
    }
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

  getAnnualCycleInstanceMetadata(instance) {
    // Find and return metadata matching model_id, experiment, variable_id
    // and instance (start_date, end_date, ensemble_name) for monthly, seasonal
    // and annual timescales.
    const {
      model_id, experiment,
      variable_id, meta,
    } = this.props;

    const monthlyVariableMetadata = _.findWhere(meta, {
      model_id, experiment, variable_id,
      ...instance,
      timescale: 'monthly',
    });
    const seasonalVariablelMetadata = findMatchingMetadata(
      monthlyVariableMetadata, { timescale: 'seasonal' }, meta
    );
    const yearlyVariableMetadata = findMatchingMetadata(
      monthlyVariableMetadata, { timescale: 'yearly' }, meta
    );
    const metadataSets = [
      monthlyVariableMetadata,
      seasonalVariablelMetadata,
      yearlyVariableMetadata,
    ];
    return metadataSets;
  },

  dataToAnnualCycleGraphSpec(meta, data) {
    let graph = timeseriesToAnnualCycleGraph(meta, ...data);

    // arrange the graph so that the highest-resolution data is most visible.
    function rankByTimeResolution(series) {
      var resolutions = ['Yearly', 'Seasonal', 'Monthly'];
      for (let i = 0; i < 3; i++) {
        if (series[0].search(resolutions[i]) !== -1) {
          return i;
        }
      }
      return 0;
    }
    graph = sortSeriesByRank(graph, rankByTimeResolution);

    return graph;
  },


  // TODO: Remove
  // /*
  //  * This function fetches and loads data  for the Long Term Average graphs.
  //  * If passed a time of year(resolution and index), it will load
  //  * data for that time of year. Otherwise, it defaults to January
  //  * (resolution: "monthly", index 0).
  //  */
  // loadLongTermAverageGraph: function (props, time) {
  //   var timescale = time ? time.timescale : this.state.longTermAverageTimeScale;
  //   var timeidx = time ? time.timeidx : this.state.longTermAverageTimeOfYear;
  //
  //   this.setLongTermAverageGraphNoDataMessage("Loading Data");
  //   var myDataPromise = this.getDataPromise(props, timescale, timeidx);
  //
  //   myDataPromise.then(response => {
  //     this.setState({
  //       longTermAverageTimeOfYear: timeidx,
  //       longTermAverageTimeScale: timescale,
  //       longTermAverageData: dataToLongTermAverageGraph([response.data]),
  //     });
  //   }).catch(error => {
  //     this.displayError(error, this.setLongTermAverageGraphNoDataMessage);
  //   });
  // },

  getLongTermAveragesMetadata(timeOfYear) {
    const metadataFromProps = _.pick(this.props,
      'ensemble_name', 'model_id', 'variable_id', 'experiment', 'area'
    );
    // Yes, the value of this function is an array of one element.
    return [
      { ...metadataFromProps, ...timeKeyToResolutionIndex(timeOfYear) },
    ];
  },

  longTermAveragesDataToGraphSpec(data) {
    return dataToLongTermAverageGraph(data);
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
   * comparing several models. It calls the "data" (long term average)
   * query for each model and composes the results into a single graph,
   * so it is only available for datasets that support the "data" query
   * (multi year means).
   */
  loadContextGraph: function (props) {

    //Graph formatting function used to emphasize the current model and
    //deemphasize all others.
    var emphasizeCurrentModel = function(graph) {
      //Helper function used to classify data series by which model generated them
      var makeModelSegmentor = function (selectedModelOutput, otherModelOutput) {
        return function(dataseries) {
          return dataseries[0].search(props.model_id) != -1 ? selectedModelOutput : otherModelOutput;
        }
      };
      graph = assignColoursByGroup(graph, makeModelSegmentor(1, 0));
      graph = fadeSeriesByRank(graph, makeModelSegmentor(1, .35));
      graph = hideSeriesInLegend(graph, makeModelSegmentor(false, true));
      graph = sortSeriesByRank(graph, makeModelSegmentor(1, 0));

      //simplify graph by turning off tooltip and missing data gaps
      graph.line.connectNull = true;
      graph.tooltip = {show: false};
      return graph;
    };

    //If the only thing changed since the last time the graph was rendered
    //is the model, we already have all the data fetched, we just need to
    //reformat the graph.
    if(this.state.contextData &&
        this.state.contextData.data.columns.length > 0 &&
        _.isEqual(props.variable_id, this.props.variable_id) &&
        _.isEqual(props.experiment, this.props.experiment)) {
      var graph = emphasizeCurrentModel(this.state.contextData);

      this.setState({
        contextData: graph
      });
    }
    else {
      this.setContextGraphNoDataMessage("Loading Data");

      var dataPromises = [];
      var dataQueryParams = [];
      var contextModels = _.without(_.uniq(_.pluck(props.contextMeta, "model_id")), props.model_id);
      var params = _.pick(props, 'experiment', 'variable_id', 'ensemble_name');
      params.timescale = 'yearly';
      params.multi_year_mean = true;

      params.model_id = props.model_id;
      dataPromises.push(this.getDataPromise(params, "yearly", 0));
      dataQueryParams.push(_.extend({}, params));

      //determine which models have data that matches this variable and experiment
      for(let i = 0; i < contextModels.length; i++ ) {
        params.model_id = contextModels[i];
        if(_.where(props.contextMeta, _.omit(params, 'ensemble_name')).length > 0){
          dataPromises.push(this.getDataPromise(params, "yearly", 0));
          dataQueryParams.push(_.extend({}, params));
        }
      }

      //fetch data from the backend and assemble the graph
      Promise.all(dataPromises).then(responses=> {
        var data = _.pluck(responses, "data");
        var graph = emphasizeCurrentModel(dataToLongTermAverageGraph(data, dataQueryParams));

        this.setState({
          contextData: graph
        });
      }).catch(error => {
        this.displayError(error, this.setContextGraphNoDataMessage);
      });
    }
  },

  render: function () {
    const statsData = this.state.statsData ? this.state.statsData : this.blankStatsData;

    const dataTableSelected = resolutionIndexToTimeKey(
      this.state.dataTableTimeScale,
      this.state.dataTableTimeOfYear
    );

    // TODO: Remove
    // const longTermAverageSelected = resolutionIndexToTimeKey(
    //   this.state.longTermAverageTimeScale,
    //   this.state.longTermAverageTimeOfYear
    // );

    return (
      <div>
        <h3>{this.props.model_id + ' ' + this.props.variable_id + ' ' + this.props.experiment}</h3>
        {
          this.multiYearMeanSelected() ? (
            <Tabs>
              <Tab eventKey={1} title='Annual Cycle'>
                <AnnualCycleGraph
                  meta={this.props.meta}
                  model_id={this.props.model_id}
                  variable_id={this.props.variable_id}
                  experiment={this.props.experiment}
                  area={this.props.area}
                  getInstanceMetadata={this.getAnnualCycleInstanceMetadata}
                  dataToGraphSpec={this.dataToAnnualCycleGraphSpec}
                />
              </Tab>
              <Tab eventKey={2} title='Long Term Averages'>
                <LongTermAveragesGraph
                  model_id={this.props.model_id}
                  variable_id={this.props.variable_id}
                  experiment={this.props.experiment}
                  meta={this.props.meta}
                  area={this.props.area}
                  getMetadata={this.getLongTermAveragesMetadata}
                  dataToGraphSpec={this.longTermAveragesDataToGraphSpec}
                  // timeOfYear={longTermAverageSelected}
                  // onChangeTimeOfYear={this.updateLongTermAverageTimeOfYear}
                  // graphSpec={this.state.longTermAverageData || this.blankGraph}
                  // onExportXslx={this.exportLongTermAverage.bind(this, 'xlsx')}
                  // onExportCsv={this.exportLongTermAverage.bind(this, 'csv')}
                />
              </Tab>
              <Tab eventKey={3} title='Model Context'>
                <ContextGraph
                  graphSpec={this.state.contextData || this.blankGraph}
                />
              </Tab>
            </Tabs>
          ) : (
            <Tabs>
              <Tab eventKey={1} title='Time Series'>
                <TimeSeriesGraph
                  graphSpec={this.state.timeseriesData || this.blankGraph}
                />
              </Tab>
            </Tabs>
          )
        }

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

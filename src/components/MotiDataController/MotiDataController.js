/************************************************************************
 * MotiDataController.js - controller to display summarized numerical data 
 *
 * This DataController is intended to be used with an ensemble that 
 * contains a small number of datasets, each of which is the average
 * of many runs. It does not offer the user a way to select or 
 * distinguish between individual runs or indicate a time of year
 * they are interested in; it should be used with an ensemble that 
 * features only one dataset for each combination of model, variable, 
 * and emission scenario.
 *
 * It receives a model, variable, and emissions scenario from its parent, 
 * MotiApp. Based on the type of variable, it loads relevant data and passes
 * it to viewer component children:
 *
 * Multi-year mean:
 *  - Annual cycle DataGraph (monthly resolution only)
 *
 * Non multi-year mean:
 *  - A freeform timeseries Datagraph showing data at whatever resolution
 *    is available.
 *
 * In both cases, a stats DataTable summarizing the dataset is also
 * generated.
 ************************************************************************/
import PropTypes from 'prop-types';

import React from 'react';
import createReactClass from 'create-react-class';
import { Button, ControlLabel } from 'react-bootstrap';

import { parseBootstrapTableData } from '../../core/util';
import DataGraph from '../DataGraph/DataGraph';
import DataTable from '../DataTable/DataTable';
import DataControllerMixin from '../DataControllerMixin';
import {timeseriesToAnnualCycleGraph,
        timeseriesToTimeseriesGraph} from '../../core/chart';
import _ from 'underscore';

import styles from './MotiDataController.css';

var MotiDataController = createReactClass({
  displayName: 'MotiDataController',

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
      annualCycleDatasetId: '',
      longTermAverageData: undefined,
      annualCycleData: undefined,
      statsData: undefined,
      dataTableTimeOfYear: 0,
    };
  },

  /*
   * Called when MotiController is first loaded. Selects and fetches an initial
   * dataset to display in the stats table and annual cycle graph.
   */
  getData: function (props) {
    if(this.multiYearMeanSelected(props)) { //load Annual Cycle graph
      this.setAnnualCycleGraphNoDataMessage("Loading Data");

      var monthlyMetadata = _.findWhere(props.meta,{
        model_id: props.model_id,
        variable_id: props.variable_id,
        experiment: props.experiment,
        timescale: "monthly" });

      var myTimeseriesPromise = this.getTimeseriesPromise(props, monthlyMetadata.unique_id);

      myTimeseriesPromise.then(response => {
        this.setState({
          annualCycleData: timeseriesToAnnualCycleGraph(props.meta, response.data),
        });
      }).catch(error => {
        this.displayError(error, this.setAnnualCycleGraphNoDataMessage);
      });
    }
    else { //load Timeseries graph
      this.setTimeseriesGraphNoDataMessage("Loading Data");

      var params = _.pick(props, 'model_id', 'variable_id', 'experiment');

      var metadata = _.findWhere(props.meta, params);

      var myTimeseriesPromise = this.getTimeseriesPromise(props, metadata.unique_id);
      myTimeseriesPromise.then(response => {
        this.setState({
          timeseriesData: timeseriesToTimeseriesGraph(props.meta, response.data)
        });
      }).catch(error => {
        this.displayError(error, this.setTimeseriesGraphNoDataMessage);
      });
    }
    
    //Load stats table
    this.setStatsTableNoDataMessage("Loading Data");
    var myStatsPromise = this.getStatsPromise(props, this.state.dataTableTimeOfYear);

    myStatsPromise.then(response => {
      //This portal doesn't offer users a choice of what time of year to display
      //stats for. It always shows annual stats.
      var stats = this.filterAPIResults(response.data, {timescale: "yearly"}, props.meta);
      this.setState({
        statsData: parseBootstrapTableData(this.injectRunIntoStats(stats), props.meta),
      });
    }).catch(error => {
      this.displayError(error, this.setStatsTableNoDataMessage);
    });
  },

  //Remove data from the Annual Cycle graph and display a message
  setAnnualCycleGraphNoDataMessage: function(message) {
    this.setState({
      annualCycleData: { data: { columns: [], empty: { label: { text: message }, }, },
                        axis: {} },
      });
  },

  //Remove data from the Stats Table and display a message
  setStatsTableNoDataMessage: function(message) {
    this.setState({
      statsTableOptions: { noDataText: message },
      statsData: [],
    });
  },

  //Remove data from the Timeseries Graph and display a message
  setTimeseriesGraphNoDataMessage: function(message) {
    this.setState({
      timeseriesData: { data: { columns: [], empty: { label: { text: message }, }, },
                        axis: {} },
      });
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    // This guards against re-rendering before calls to the data server alter
    // the state
    return !(_.isEqual(nextState.statsData, this.state.statsData) &&
           _.isEqual(nextState.annualCycleData, this.state.annualCycleData) &&
           _.isEqual(nextProps.meta, this.props.meta) &&
           _.isEqual(nextState.timeseriesData, this.state.timeseriesData) &&
           _.isEqual(nextState.statsTableOptions, this.state.statsTableOptions));
  },

  render: function () {
    var statsData = this.state.statsData ? this.state.statsData : this.blankStatsData;

    var graph;
    if(this.multiYearMeanSelected(this.props)) {
      var annualCycleData = this.state.annualCycleData ? this.state.annualCycleData : this.blankGraph;
      graph = (
          <div>
            <div>
              <ControlLabel className={styles.exportlabel}>Download Data</ControlLabel>
              <Button onClick={this.exportAnnualCycle.bind(this, 'xlsx')}>XLSX</Button>
              <Button onClick={this.exportAnnualCycle.bind(this, 'csv')}>CSV</Button>
            </div>
            <DataGraph data={annualCycleData.data} axis={annualCycleData.axis} tooltip={annualCycleData.tooltip} />
          </div>
          );
    }
    else {
      var timeseriesData = this.state.timeseriesData ? this.state.timeseriesData : this.blankGraph;
      graph = (
          <div>
            <DataGraph data={timeseriesData.data} axis={timeseriesData.axis} tooltip={timeseriesData.tooltip} subchart={timeseriesData.subchart} />
            <ControlLabel className={styles.graphlabel}>Highlight a time span on lower graph to see more detail</ControlLabel>
          </div>);
    }

    return (
      <div>
        <h3>{this.props.model_id + ' ' + this.props.variable_id + ' ' + this.props.experiment}</h3>
        {graph}
        <DataTable data={statsData} options={this.state.statsTableOptions} />
        <div style={{ marginTop: '10px' }}>
          <Button style={{ marginRight: '10px' }} onClick={this.exportDataTable.bind(this, 'xlsx')}>Export To XLSX</Button>
          <Button onClick={this.exportDataTable.bind(this, 'csv')}>Export To CSV</Button>
        </div>
      </div>
    );
  },
});

export default MotiDataController;
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
 * MotiApp. It loads the relevant data and passes them as props to its
 * viewer component children:
 * - an annual cycle DataGraph (with only monthly data)
 * - a projected change DataGraph (with only one trendline)
 * - a stats DataTable (with only one entry per climatology period)
 ************************************************************************/
import React from 'react';
import { Button, ControlLabel } from 'react-bootstrap';

import { parseBootstrapTableData } from '../../core/util';
import DataGraph from '../DataGraph/DataGraph';
import DataTable from '../DataTable/DataTable';
import DataControllerMixin from '../DataControllerMixin';
import {timeseriesToAnnualCycleGraph} from '../../core/chart';
import _ from 'underscore';

import styles from './MotiDataController.css';

var MotiDataController = React.createClass({

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
      timeSeriesDatasetId: '',
      climoSeriesData: undefined,
      timeSeriesData: undefined,
      statsData: undefined,
      dataTableTimeOfYear: 0,
    };
  },

  /*
   * Called when MotiController is first loaded. Selects and fetches an initial
   * dataset to display in the stats table and annual cycle graph.
   */
  getData: function (props) {
    this.setTimeSeriesNoDataMessage("Loading Data");

    this.setStatsTableNoDataMessage("Loading Data");  
    
    var monthlyMetadata = _.findWhere(props.meta,{
      model_id: props.model_id,
      variable_id: props.variable_id,
      experiment: props.experiment,
      timescale: "monthly" });
          
    var myStatsPromise = this.getStatsPromise(props, this.state.dataTableTimeOfYear);

    var myTimeseriesPromise = this.getTimeseriesPromise(props, monthlyMetadata.unique_id);
   
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

    myTimeseriesPromise.then(response => {
      this.setState({
        timeSeriesData: timeseriesToAnnualCycleGraph(props.meta, response.data),
      });
      
    }).catch(error => {
      this.displayError(error, this.setTimeSeriesNoDataMessage);
    });
  },

  //Remove data from the Annual Cycle graph and display a message
  setTimeSeriesNoDataMessage: function(message) {
    this.setState({
      timeSeriesData: { data: { columns: [], empty: { label: { text: message }, }, },
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

  shouldComponentUpdate: function (nextProps, nextState) {
    // This guards against re-rendering before calls to the data server alter
    // the state
    return JSON.stringify(nextState.statsData) !== JSON.stringify(this.state.statsData) ||
           JSON.stringify(nextState.timeSeriesData) !== JSON.stringify(this.state.timeSeriesData) ||
           JSON.stringify(nextProps.meta) !== JSON.stringify(this.props.meta) ||
           nextState.statsTableOptions !== this.state.statsTableOptions;
  },

  render: function () {
    var timeSeriesData = this.state.timeSeriesData ? this.state.timeSeriesData : { data: { columns: [] }, axis: {} };
    var statsData = this.state.statsData ? this.state.statsData : [];

    return (
      <div>
        <h3>{this.props.model_id + ' ' + this.props.variable_id + ' ' + this.props.experiment}</h3>
        <div>
          <ControlLabel className={styles.exportlabel}>Download Data</ControlLabel>
          <Button onClick={this.exportTimeSeries.bind(this, 'xlsx')}>XLSX</Button>
          <Button onClick={this.exportTimeSeries.bind(this, 'csv')}>CSV</Button>
        </div>
        <DataGraph data={timeSeriesData.data} axis={timeSeriesData.axis} tooltip={timeSeriesData.tooltip} />

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

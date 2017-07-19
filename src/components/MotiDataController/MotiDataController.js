import React from 'react';
import { Button, ControlLabel } from 'react-bootstrap';

import { parseTimeSeriesForC3,
  parseBootstrapTableData } from '../../core/util';
import DataGraph from '../DataGraph/DataGraph';
import DataTable from '../DataTable/DataTable';
import DataControllerMixin from '../DataControllerMixin';
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
    };
  },

  getData: function (props) {
    this.setTimeSeriesNoDataMessage("Loading Data");

    this.setStatsTableNoDataMessage("Loading Data");  
    
    var monthlyMetadata = _.find(props.meta, function(dataset) {
      return dataset.model_id == props.model_id &&
             dataset.variable_id == props.variable_id &&
             dataset.experiment == props.experiment &&
             dataset.timescale == "monthly";
    });
          
    var myStatsPromise = this.getStatsPromise(props, this.state.dataTableTimeOfYear);

    var myTimeseriesPromise = this.getTimeseriesPromise(props, monthlyMetadata.unique_id);
   
    myStatsPromise.then(response => {
      this.setState({
        statsData: parseBootstrapTableData(this.injectRunIntoStats(response.data), props.meta),
      });
    }).catch(error => {
      this.displayError(error, this.setStatsTableNoDataMessage);
    });

    myTimeseriesPromise.then(response => {
      this.setState({
        timeSeriesData: parseTimeSeriesForC3(response.data, false),
      });
    }).catch(error => {
      this.displayError(error, this.setTimeSeriesNoDataMessage);
    });
  },

  setTimeSeriesNoDataMessage: function(message) {
    this.setState({
      timeSeriesData: { data: { columns: [], empty: { label: { text: message }, }, },
                        axis: {} },
      });
  },

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

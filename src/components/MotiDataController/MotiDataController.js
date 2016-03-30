import React from 'react';
import { Button } from 'react-bootstrap';

import {
  parseBootstrapTableData } from '../../core/util';
import { timeseriesToC3 } from '../../core/chart';
import DataGraph from '../DataGraph/DataGraph';
import DataTable from '../DataTable/DataTable';
import DataControllerMixin from '../DataControllerMixin';

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
    var myStatsPromise = this.getStatsPromise(props, this.state.dataTableTimeOfYear);

    var myTimeseriesPromise = this.getTimeseriesPromise(props, props.meta[0].unique_id);

    $.when(myStatsPromise, myTimeseriesPromise)
     .done(function (statsResponse, timeseriesResponse) {
       this.setState({
         statsData: parseBootstrapTableData(this.injectRunIntoStats(statsResponse[0])),
         timeSeriesData: timeseriesToC3(timeseriesResponse[0]),
       });
     }.bind(this));
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    // This guards against re-rendering before Ajax calls alter the state
    return JSON.stringify(nextState.statsData) !== JSON.stringify(this.state.statsData) ||
           JSON.stringify(nextState.timeSeriesData) !== JSON.stringify(this.state.timeSeriesData) ||
           JSON.stringify(nextProps.meta) !== JSON.stringify(this.props.meta);
  },

  render: function () {
    var timeSeriesData = this.state.timeSeriesData ? this.state.timeSeriesData : { data: { columns: [] }, axis: {} };
    var statsData = this.state.statsData ? this.state.statsData : [];

    return (
      <div>
        <h3>{this.props.model_id + ' ' + this.props.variable_id + ' ' + this.props.experiment}</h3>
        <DataGraph data={timeSeriesData.data} axis={timeSeriesData.axis} tooltip={timeSeriesData.tooltip} />

        <DataTable data={statsData} />
        <div style={{ marginTop: '10px' }}>
          <Button style={{ marginRight: '10px' }} onClick={this.exportDataTable.bind(this, 'xlsx')}>Export To XLSX</Button>
          <Button onClick={this.exportDataTable.bind(this, 'csv')}>Export To CSV</Button>
        </div>
      </div>
    );
  },
});

export default MotiDataController;

import React from 'react';
import urljoin from 'url-join';
import _ from 'underscore';
import { Button } from 'react-bootstrap';

import {
  parseBootstrapTableData,
  exportTableDataToWorksheet } from '../../core/util';
import { timeseriesToC3 } from '../../core/chart';
import DataGraph from '../DataGraph/DataGraph';
import DataTable from '../DataTable/DataTable';

var MotiDataController = React.createClass({

  propTypes: {
    model_id: React.PropTypes.string,
    variable_id: React.PropTypes.string,
    experiment: React.PropTypes.string,
    area: React.PropTypes.string,
    meta: React.PropTypes.array,
  },

  getInitialState: function () {
    return {
      timeSeriesDatasetId: '',
      climoSeriesData: undefined,
      timeSeriesData: undefined,
      statsData: undefined,
    };
  },

  injectRunIntoStats: function (data) {
    // Injects model run information into object returned by stats call
    _.map(data, function (val, key) {
      var selected = this.props.meta.filter(function (el) {
        return el.unique_id === key;
      });
      _.extend(val, { run: selected[0].ensemble_member });
    }.bind(this));
    return data;
  },

  getStatsPromise: function (props, timeidx) {
    return $.ajax({
      url: urljoin(CE_BACKEND_URL, 'multistats'),
      crossDomain: true,
      data: {
        ensemble_name: CE_ENSEMBLE_NAME,
        model: props.model_id,
        variable: props.variable_id,
        emission: props.experiment,
        area: props.area || null,
        time: timeidx,
      },
    });
  },

  getTimeseriesPromise: function (props, timeSeriesDatasetId) {
    return $.ajax({
      url: urljoin(CE_BACKEND_URL, 'timeseries'),
      crossDomain: true,
      data: {
        id_: timeSeriesDatasetId || null,
        variable: props.variable_id,
        area: props.area || null,
      },
    });
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

  verifyParams: function (props) {
    var stringPropList = _.values(_.pick(props, 'meta', 'model_id', 'variable_id', 'experiment'));
    return (stringPropList.length > 0) && stringPropList.every(Boolean);
  },

  componentDidMount: function () {
    if (this.verifyParams(this.props)) {
      this.getData(this.props);
    }
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({
      timeSeriesDatasetId: nextProps.meta[0].unique_id,
    });
    if (this.verifyParams(nextProps)) {
      this.getData(nextProps);
    }
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    // This guards against re-rendering before Ajax calls alter the state
    return JSON.stringify(nextState.statsData) !== JSON.stringify(this.state.statsData) ||
           JSON.stringify(nextState.timeSeriesData) !== JSON.stringify(this.state.timeSeriesData) ||
           JSON.stringify(nextProps.meta) !== JSON.stringify(this.props.meta);
  },

  exportDataTable: function (format) {
    exportTableDataToWorksheet(this.props, this.state.statsData, format, this.state.dataTableTimeOfYear);
  },

  render: function () {
    var timeSeriesData = this.state.timeSeriesData ? this.state.timeSeriesData : { data: { columns: [] }, axis: {} };
    var statsData = this.state.statsData ? this.state.statsData : [];

    return (
      <div>

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

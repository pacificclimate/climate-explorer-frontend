import React, { PropTypes, Component } from 'react';
import urljoin from 'url-join';
import _ from 'underscore';
import ReactTabs, { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Button, Input, Row, Col } from 'react-bootstrap';

import { dataApiToC3, parseTimeSeriesForC3, parseBootstrapTableData, exportTableDataToWorksheet } from '../../core/util';
import DataGraph from '../DataGraph/DataGraph';
import DataTable from '../DataTable/DataTable';
import Selector from '../Selector';
import TimeOfYearSelector from '../Selector/TimeOfYearSelector';

var DataController = React.createClass({

  propTypes: {
    model_id: React.PropTypes.string,
    variable_id: React.PropTypes.string,
    experiment: React.PropTypes.string,
    area: React.PropTypes.string,
    meta: React.PropTypes.array
  },

  getInitialState: function () {
    return {
      projChangeTimeOfYear: 0,
      dataTableTimeOfYear: 0,
      timeSeriesDatasetId: '',
      climoSeriesData: undefined,
      timeSeriesData: undefined,
      statsData: undefined
    };
  },

  injectRunIntoStats: function (data) {
    // Injects model run information into object returned by stats call
    _.map(data, function (val, key) {
      var selected = this.props.meta.filter(function (el) {
        return el.unique_id === key;
      });
      val['run'] = selected[0].ensemble_member;
    }.bind(this));
    return data;
  },

  getDataPromise: function (props, timeidx) {
    return $.ajax({
      url: urljoin(CE_BACKEND_URL, 'data'),
      crossDomain: true,
      data: {
        model: props.model_id,
        variable: props.variable_id,
        emission: props.experiment,
        area: props.area || null,
        time: timeidx
      }
    });
  },

  getStatsPromise: function (props, timeidx) {
    return $.ajax({
      url: urljoin(CE_BACKEND_URL, 'multistats'),
      crossDomain: true,
      data: {
        model: props.model_id,
        variable: props.variable_id,
        emission: props.experiment,
        area: props.area || null,
        time: timeidx
      }
    });
  },

  getTimeseriesPromise: function (props, timeSeriesDatasetId) {
    return $.ajax({
      url: urljoin(CE_BACKEND_URL, 'timeseries'),
      crossDomain: true,
      data: {
        id_ : timeSeriesDatasetId || null,
        variable: props.variable_id,
        area: props.area || null
      }
    });
  },

  getData: function (props) {
    var my_data_promise = this.getDataPromise(props, this.state.projChangeTimeOfYear);

    var my_stats_promise = this.getStatsPromise(props, this.state.dataTableTimeOfYear);

    var my_timeseries_promise = this.getTimeseriesPromise(props, props.meta[0].unique_id);

    $.when(my_data_promise, my_stats_promise, my_timeseries_promise)
     .done(function (data_response, stats_response, timeseries_response) {
       this.setState({
         climoSeriesData: dataApiToC3(data_response[0]),
         statsData: parseBootstrapTableData(this.injectRunIntoStats(stats_response[0])),
         timeSeriesData: parseTimeSeriesForC3(timeseries_response[0])
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

  shouldComponentUpdate: function (nextProps, nextState) {
    // This guards against re-rendering before Ajax calls alter the state
    return JSON.stringify(nextState.climoSeriesData) !== JSON.stringify(this.state.climoSeriesData) ||
           JSON.stringify(nextState.statsData) !== JSON.stringify(this.state.statsData) ||
           JSON.stringify(nextState.timeSeriesData) !== JSON.stringify(this.state.timeSeriesData) ||
           JSON.stringify(nextProps.meta) !== JSON.stringify(this.props.meta);
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({
      timeSeriesDatasetId: nextProps.meta[0].unique_id
    });
    if (this.verifyParams(nextProps)) {
      this.getData(nextProps);
    }
  },

  updateProjChangeTimeOfYear: function (timeidx) {
    this.setState({
      projChangeTimeOfYear: timeidx
    });
    this.getDataPromise(this.props, timeidx).done(function (data) {
      this.setState({
        climoSeriesData: dataApiToC3(data),
      });
    }.bind(this));

  },

  updateDataTableTimeOfYear: function (timeidx) {
    this.setState({
      dataTableTimeOfYear: timeidx
    });
    this.getStatsPromise(this.props, timeidx).done(function (data) {
      this.setState({
        statsData: parseBootstrapTableData(this.injectRunIntoStats(data)),
      });
    }.bind(this));
  },

  updateAnnCycleDataset: function (dataset) {
    this.setState({
      timeSeriesDatasetId: dataset,
    });
    this.getTimeseriesPromise(this.props, dataset).done(function (data) {
      this.setState({
        timeSeriesData: parseTimeSeriesForC3(data)
      });
    }.bind(this));
  },

  exportDataTable: function (format) {
    exportTableDataToWorksheet(this.props, this.state.statsData, format, this.state.dataTableTimeOfYear);
  },

  render: function () {
    var climoSeriesData = this.state.climoSeriesData ? this.state.climoSeriesData : { data:{ columns:[] }, axis:{} };
    var timeSeriesData = this.state.timeSeriesData ? this.state.timeSeriesData : { data:{ columns:[] }, axis:{} };
    var statsData = this.state.statsData ? this.state.statsData : [];
    var ids = this.props.meta.map(function (el) {
      var period = el.unique_id.split('_').slice(5)[0];
      var period = period.split('-').map(function (datestring) {return datestring.slice(0, 4);}).join('-');
      var l = [el.unique_id, el.unique_id.split('_').slice(4, 5) + ' ' + period];
      return l;
    });

    return (
      <div>
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
            </Row>
            <DataGraph data={timeSeriesData.data} axis={timeSeriesData.axis} tooltip={timeSeriesData.tooltip} />
          </TabPanel>
          <TabPanel>
            <Row>
              <Col lg={4} lgPush={8} md={6} mdPush={6} sm={6} smPush={6}>
                <TimeOfYearSelector onChange={this.updateProjChangeTimeOfYear} />
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
        <DataTable data={statsData} />
        <div style={{ marginTop: '10px' }}>
          <Button style={{ marginRight: '10px' }} onClick={this.exportDataTable.bind(this, 'xlsx')}>Export To XLSX</Button>
          <Button onClick={this.exportDataTable.bind(this, 'csv')}>Export To CSV</Button>
        </div>
      </div>
  );}
});

export default DataController;

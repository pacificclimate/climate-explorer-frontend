import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Button, Row, Col } from 'react-bootstrap';
import Loader from 'react-loader';
import _ from 'underscore';


import {
  dataApiToC3,
  parseTimeSeriesForC3,
  parseBootstrapTableData,
  mergeC3DataGraphs} from '../../core/util';
import{ timeseriesToAnnualCycleGraph} from '../../core/chart';
import DataGraph from '../DataGraph/DataGraph';
import Selector from '../Selector';
import TimeOfYearSelector from '../Selector/TimeOfYearSelector';
import DataControllerMixin from '../DataControllerMixin';

var DualDataController = React.createClass({

  propTypes: {
    model_id: React.PropTypes.string,
    variable_id: React.PropTypes.string,
    comparand_id: React.PropTypes.string,
    experiment: React.PropTypes.string,
    area: React.PropTypes.string,
    meta: React.PropTypes.array,
    comparandMeta: React.PropTypes.array,
  },

  mixins: [DataControllerMixin],

  getInitialState: function () {
    return {
      projChangeTimeOfYear: 0,
      dataTableTimeOfYear: 0,
      timeSeriesDatasetId: '',
      climoSeriesData: undefined,
      timeSeriesData: undefined,
      statsData: undefined,
    };
  },

  getData: function (props) {
    this.setTimeSeriesNoDataMessage("Loading Data");
    this.setClimoSeriesNoDataMessage("Loading Data");

    //fetch and graph projected change data
    var variableDataParams = _.pick(props, 'model_id', 'experiment', 'area', 'variable_id');
    var variableDataPromise = this.getDataPromise(props, this.state.projChangeTimeOfYear);
    var comparandDataParams = _.pick(props, 'model_id', 'experiment', 'area');
    comparandDataParams.variable_id = props.comparand_id;
    var comparandDataPromise = this.getDataPromise(comparandDataParams, this.state.projChangeTimeOfYear);
    Promise.all([variableDataPromise, comparandDataPromise]).then(values=> {
      this.setState({
        climoSeriesData: mergeC3DataGraphs(dataApiToC3(values[0].data), this.props.variable_id,
                                           dataApiToC3(values[1].data), this.props.comparand_id)
      });
    }).catch(error => {
      this.displayError(error, this.setClimoSeriesNoDataMessage);
    });

    //fetch and graph annual cycle data
    var variableMetadata = _.find(props.meta, function(dataset){
      return dataset.model_id == props.model_id &&
      dataset.variable_id == props.variable_id &&
      dataset.experiment == props.experiment &&
      dataset.timescale == "monthly";
    });
    console.log("Dual variable:");
    console.log(variableMetadata);
    
    var comparandMetadata = _.find(props.comparandMeta, function(dataset){
      return dataset.model_id == props.model_id &&
      dataset.variable_id == props.comparand_id &&
      dataset.experiment == props.experiment &&
      dataset.ensemble_member == variableMetadata.ensemble_member &&
      dataset.start_date == variableMetadata.start_date &&
      dataset.end_date == variableMetadata.end_date &&
      dataset.timescale == "monthly";
    });
    console.log("comparandMeta = ");
    console.log(props.comparandMeta);
    console.log("Dual comparand:");
    console.log(comparandMetadata);
    
    var variableTimeseriesParams = {variable_id: props.variable_id, area: props.area};
    var variableTimeseriesPromise = this.getTimeseriesPromise(variableTimeseriesParams, variableMetadata.unique_id);
    var comparandTimeseriesParams = {variable_id: props.comparand_id, area: props.area};
    var comparandTimeseriesPromise = this.getTimeseriesPromise(comparandTimeseriesParams, comparandMetadata.unique_id);
    Promise.all([variableTimeseriesPromise, comparandTimeseriesPromise]).then(series=> {
      this.setState({
        //timeSeriesData: mergeC3DataGraphs(parseTimeSeriesForC3(values[0].data), this.props.variable_id,
        //                                  parseTimeSeriesForC3(values[1].data), this.props.comparand_id)
        timeSeriesData: timeseriesToAnnualCycleGraph([variableMetadata, comparandMetadata], 
                                                     series[0].data, series[1].data),
      });
    }).catch(error=>{
      this.displayError(error, this.setTimeSeriesNoDataMessage);
      console.log(error);
    });
  },

  setTimeSeriesNoDataMessage: function(message) {
    this.setState({
      timeSeriesData: { data: { columns: [], empty: { label: { text: message }, }, },
                        axis: {} },
      });
  },

  setClimoSeriesNoDataMessage: function(message) {
    this.setState({
      climoSeriesData: { data: { columns: [], empty: { label: { text: message }, }, },
                         axis: {} },
      });
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    // This guards against re-rendering before calls to the data sever alter the
    // state
     return JSON.stringify(nextState.climoSeriesData) !== JSON.stringify(this.state.climoSeriesData) ||
     JSON.stringify(nextState.timeSeriesData) !== JSON.stringify(this.state.timeSeriesData) ||
     JSON.stringify(nextProps.meta) !== JSON.stringify(this.props.meta) ||
     JSON.stringify(nextProps.comparandMeta) !== JSON.stringify(this.props.comparandMeta);
  },

  updateProjChangeTimeOfYear: function (timeidx) {
    this.setClimoSeriesNoDataMessage("Loading Data");
    this.setState({
      projChangeTimeOfYear: timeidx,
    });
    this.getDataPromise(this.props, timeidx).then(response => {
      this.setState({
        climoSeriesData: dataApiToC3(response.data),
      });
    }).catch(error => {
      this.displayError(error, this.setClimoSeriesNoDataMessage);
    });
  },

  updateAnnCycleDataset: function (dataset) {
    this.setTimeSeriesNoDataMessage("Loading Data");
    this.setState({
      timeSeriesDatasetId: dataset,
    });
    this.getTimeseriesPromise(this.props, dataset).then(response => {
      this.setState({
        timeSeriesData: parseTimeSeriesForC3(response.data),
      });
    }).catch(error => {
      this.displayError(error, this.setTimeSeriesNoDataMessage);
    });
  },

  render: function () {
    var climoSeriesData = this.state.climoSeriesData ? this.state.climoSeriesData : { data: { columns: [] }, axis: {} };
    var timeSeriesData = this.state.timeSeriesData ? this.state.timeSeriesData : { data: { columns: [] }, axis: {} };
    var ids = this.props.meta.map(function (el) {
      var period = el.unique_id.split('_').slice(5)[0];
      period = period.split('-').map(function (datestring) {return datestring.slice(0, 4);}).join('-');
      var l = [el.unique_id, el.unique_id.split('_').slice(4, 5) + ' ' + period];
      return l;
    });

    return (
      <div>
        <h3>{`${this.props.model_id} ${this.props.experiment}: ${this.props.variable_id} vs ${this.props.comparand_id}`}</h3>
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
      </div>
    );
  },
});

export default DualDataController;

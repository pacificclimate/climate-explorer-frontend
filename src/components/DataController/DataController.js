import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Button, Row, Col, ControlLabel } from 'react-bootstrap';
import Loader from 'react-loader';
import _ from 'underscore';

import styles from './DataController.css';

import {
  dataApiToC3,
  parseTimeSeriesForC3,
  parseBootstrapTableData } from '../../core/util';
import {timeseriesToAnnualCycleGraph} from '../../core/chart';
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
      dataTableTimeOfYear: 0,
      timeSeriesRun: undefined,
      climoSeriesData: undefined,
      timeSeriesData: undefined,
      statsData: undefined,
    };
  },

  getData: function (props) {

    this.setTimeSeriesNoDataMessage("Loading Data");
    this.setClimoSeriesNoDataMessage("Loading Data");
    this.setStatsTableNoDataMessage("Loading Data");
    
    var monthlyMetadata = _.find(props.meta, function(dataset){
      return dataset.model_id == props.model_id &&
      dataset.variable_id == props.variable_id &&
      dataset.experiment == props.experiment &&
      dataset.timescale == "monthly";
    });

    var yearlyMetadata = _.find(props.meta, function(dataset){
      return dataset.model_id == props.model_id &&
      dataset.variable_id == props.variable_id &&
      dataset.experiment == props.experiment &&
      dataset.ensemble_member == monthlyMetadata.ensemble_member &&
      dataset.start_date == monthlyMetadata.start_date &&
      dataset.end_date == monthlyMetadata.end_date &&
      dataset.timescale == "yearly";
    });
    
    var seasonalMetadata = _.find(props.meta, function(dataset){
      return dataset.model_id == props.model_id &&
      dataset.variable_id == props.variable_id &&
      dataset.experiment == props.experiment &&
      dataset.ensemble_member == monthlyMetadata.ensemble_member &&
      dataset.start_date == monthlyMetadata.start_date &&
      dataset.end_date == monthlyMetadata.end_date &&
      dataset.timescale == "seasonal";
    });
    
    var myDataPromise = this.getDataPromise(props, this.state.projChangeTimeOfYear);

    var myStatsPromise = this.getStatsPromise(props, this.state.dataTableTimeOfYear);

    var monthlyPromise = this.getTimeseriesPromise(props, monthlyMetadata.unique_id);
    var seasonalPromise = this.getTimeseriesPromise(props, seasonalMetadata.unique_id);
    var yearlyPromise = this.getTimeseriesPromise(props, yearlyMetadata.unique_id);


    myDataPromise.then(response => {
      this.setState({
        climoSeriesData: dataApiToC3(response.data),
      });
    }).catch(error => {
      this.displayError(error, this.setClimoSeriesNoDataMessage);
    });

    myStatsPromise.then(response => {
      this.setState({
        statsData: parseBootstrapTableData(this.injectRunIntoStats(response.data), props.meta),
      });
    }).catch(error => {
      this.displayError(error, this.setStatsTableNoDataMessage);
    });

    Promise.all([monthlyPromise, seasonalPromise, yearlyPromise]).then(series => {
      this.setState({
        timeSeriesData: timeseriesToAnnualCycleGraph(props.meta, 
            series[0].data, series[1].data, series[2].data),
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

  setStatsTableNoDataMessage: function(message) {
    this.setState({
      statsTableOptions: { noDataText: message },
      statsData: [],
    });
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    // This guards against re-rendering before calls to the data sever alter the
    // state
     return JSON.stringify(nextState.climoSeriesData) !== JSON.stringify(this.state.climoSeriesData) ||
     JSON.stringify(nextState.statsData) !== JSON.stringify(this.state.statsData) ||
     JSON.stringify(nextState.timeSeriesData) !== JSON.stringify(this.state.timeSeriesData) ||
     JSON.stringify(nextProps.meta) !== JSON.stringify(this.props.meta) ||
     nextState.statsTableOptions !== this.state.statsTableOptions;
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

  updateDataTableTimeOfYear: function (timeidx) {
    this.setStatsTableNoDataMessage("Loading Data");
    this.setState({
      dataTableTimeOfYear: timeidx,
    });
    this.getStatsPromise(this.props, timeidx).then(response => {
      this.setState({
        statsData: parseBootstrapTableData(this.injectRunIntoStats(response.data), this.props.meta),
      });
    }).catch(error => {
      this.displayError(error, this.setStatsTableNoDataMessage);
    });
  },

  updateAnnCycleDataset: function (run) {
    this.setTimeSeriesNoDataMessage("Loading Data");
    this.setState({
      timeSeriesRun: JSON.parse(run),
    });
    console.log("run = ");
    console.log(run);
    var dataset = _.find(this.props.meta, set => {
      return set.model_id == this.props.model_id &&
      set.variable_id == this.props.variable_id &&
      set.experiment == this.props.experiment &&
      set.timescale == "monthly" &&
      set.start_date == JSON.parse(run).start_date &&
      set.end_date == JSON.parse(run).end_date &&
      set.ensemble_member == JSON.parse(run).ensemble_member;
    });
    this.getTimeseriesPromise(this.props, dataset.unique_id).then(response => {
      this.setState({
        timeSeriesData: parseTimeSeriesForC3(response.data, true),
      });
    }).catch(error => {
      this.displayError(error, this.setTimeSeriesNoDataMessage);
    });
  },

  render: function () {
    var climoSeriesData = this.state.climoSeriesData ? this.state.climoSeriesData : { data: { columns: [] }, axis: {} };
    var timeSeriesData = this.state.timeSeriesData ? this.state.timeSeriesData : { data: { columns: [] }, axis: {} };
    var statsData = this.state.statsData ? this.state.statsData : [];
    
    //make a list of all the unique combinations of run + climatological period
    //a user could decide to view.
    //Not sure JSON is the right way to do this, though.
    //FIXME: figure out what can be used with the selector callback.
    var ids = this.props.meta.map(function (el) {
        return [JSON.stringify(_.pick(el, 'start_date', 'end_date', 'ensemble_member')),
            `${el.ensemble_member} ${el.start_date}-${el.end_date}`];
    });
    ids = _.uniq(ids, false, function(item){return item[1]});

    console.log(ids);

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

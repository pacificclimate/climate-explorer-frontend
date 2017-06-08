import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Button, Row, Col } from 'react-bootstrap';
import Loader from 'react-loader';


import {
  dataApiToC3,
  parseTimeSeriesForC3,
  parseBootstrapTableData } from '../../core/util';
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
      timeSeriesDatasetId: '',
      climoSeriesData: undefined,
      timeSeriesData: undefined,
      statsData: undefined,
    };
  },

  getData: function (props) {
          
    this.setTimeSeriesNoDataMessage("Loading Data");
    this.setClimoSeriesNoDataMessage("Loading Data");
    this.setStatsTableNoDataMessage("Loading Data");
      
    var myDataPromise = this.getDataPromise(props, this.state.projChangeTimeOfYear);

    var myStatsPromise = this.getStatsPromise(props, this.state.dataTableTimeOfYear);

    var myTimeseriesPromise = this.getTimeseriesPromise(props, props.meta[0].unique_id);
    

    myDataPromise.then(response => {
      this.setState({
        climoSeriesData: dataApiToC3(response.data),
      });
    }).catch(error => {
      this.displayError(error, this.setClimoSeriesNoDataMessage);
    });
    
    myStatsPromise.then(response => {
      this.setState({
        statsData: parseBootstrapTableData(this.injectRunIntoStats(response.data)),
      });
    }).catch(error => {
      this.displayError(error, this.setStatsTableNoDataMessage);
    }); 
    
    myTimeseriesPromise.then(response => {
      this.setState({
        timeSeriesData: parseTimeSeriesForC3(response.data, true),
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
        statsData: parseBootstrapTableData(this.injectRunIntoStats(response.data)),
      });
    }).catch(error => {
      this.displayError(error, this.setStatsTableNoDataMessage);
    });
  },

  updateAnnCycleDataset: function (dataset) {
    this.setTimeSeriesNoDataMessage("Loading Data");
    this.setState({
      timeSeriesDatasetId: dataset,
    });
    this.getTimeseriesPromise(this.props, dataset).then(response => {
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
    var ids = this.props.meta.map(function (el) {
      var period = el.unique_id.split('_').slice(5)[0];
      period = period.split('-').map(function (datestring) {return datestring.slice(0, 4);}).join('-');
      var l = [el.unique_id, el.unique_id.split('_').slice(4, 5) + ' ' + period];
      return l;
    });

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
                  Download Data
                  <br/>
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
                  Download Data
                  <br/>
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

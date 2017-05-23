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
    

    myDataPromise.then(function(response) {
      this.setState({
        climoSeriesData: dataApiToC3(response.data),
      });
    }.bind(this)).catch(function(error) {
      this.displayError(error, this.setClimoSeriesNoDataMessage);
    }.bind(this));
    
    myStatsPromise.then(function(response) {
      this.setState({
        statsData: parseBootstrapTableData(this.injectRunIntoStats(response.data)),
      });
    }.bind(this)).catch(function(error) {
      this.displayError(error, this.setStatsTableNoDataMessage);
    }.bind(this)); 
    
    myTimeseriesPromise.then(function(response) {
      this.setState({
        timeSeriesData: parseTimeSeriesForC3(response.data),
      });
    }.bind(this)).catch(function(error) {
      this.displayError(error, this.setTimeSeriesNoDataMessage);
    }.bind(this));
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
    this.getDataPromise(this.props, timeidx).then(function(response) {
      this.setState({
        climoSeriesData: dataApiToC3(response.data),
      });
    }.bind(this)).catch(function(error) {
      this.displayError(error, this.setClimoSeriesNoDataMessage);
    }.bind(this));    
  },

  updateDataTableTimeOfYear: function (timeidx) {
    this.setStatsTableNoDataMessage("Loading Data");
    this.setState({
      dataTableTimeOfYear: timeidx,
    });    
    this.getStatsPromise(this.props, timeidx).then(function(response){
      this.setState({
        statsData: parseBootstrapTableData(this.injectRunIntoStats(response.data)),
      });
    }.bind(this)).catch(function(error) {
      this.displayError(error, this.setStatsTableNoDataMessage);
    }.bind(this));
  },

  updateAnnCycleDataset: function (dataset) {
    this.setTimeSeriesNoDataMessage("Loading Data");
    this.setState({
      timeSeriesDatasetId: dataset,
    });
    this.getTimeseriesPromise(this.props, dataset).then(function(response) {
      this.setState({
        timeSeriesData: parseTimeSeriesForC3(response.data),
      });
    }.bind(this)).catch(function(error) {
      this.displayError(error, this.setTimeSeriesNoDataMessage);
    }.bind(this));
  },
  
  // displayError: function(error, displayMethod) {
  // if(error.response) { // data server sent a non-200 response
  // displayMethod("Error: " + error.response.status + " received from data
  // server.");
  // }else if(error.request) { // data server didn't respond
  // displayMethod("Error: no response received from data server.");
  // }else { // either a failed data validation
      // or a generic and somewhat unhelpful "Network Error" from axios
      // Testing turned up "Network Error" in two cases:
      // the server is down, or the server has a 500 error
      // other http error statuses tested were reflected in
      // error.response.status as expected
      // (see https://github.com/mzabriskie/axios/issues/383)
   // displayMethod(error.message);
   // }
  // },
  
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

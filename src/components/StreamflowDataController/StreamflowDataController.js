/*******************************************************************
 * StreamFlowDataController.js - controller component for numerical
 * visualization of streamflow.
 * 
 * Receives a model and an experiment from its parent, 
 * StreamflowController. Waits for the user to select a streamflow
 * station on the map, at which point it queries the API to retrive
 * data on those stations.
 * 
 * Displays a Time Series datagraph showing each point available and
 * a Data Table showing summary information.
 * 
 * At present, only supports nominal-time streamflow data (because 
 * that is the only data available to the developers right now)
 * but should eventually be able to generate Annual Cycle and Long
 * Term Average datagraphs if the station selected has available
 * multi-year mean data. 
 *******************************************************************/

import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Button, Row, Col, ControlLabel } from 'react-bootstrap';
import Loader from 'react-loader';
import _ from 'underscore';

import styles from './StreamflowDataController.css';

import { parseBootstrapTableData,
         timeResolutionIndexToTimeOfYear,
         timeKeyToResolutionIndex,
         resolutionIndexToTimeKey} from '../../core/util';
import {timeseriesToAnnualCycleGraph,
        dataToLongTermAverageGraph,
        timeseriesToTimeseriesGraph} from '../../core/chart';
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
    stations: React.PropTypes.array,
    meta: React.PropTypes.array,
    ensemble_name: React.PropTypes.string,
  },

  mixins: [DataControllerMixin],

  getInitialState: function () {
    return {
      longTermAverageTimeOfYear: 0,
      longTermAverageTimeScale: "monthly",
      dataTableTimeOfYear: 0,
      dataTableTimeScale: "monthly",
      annualCycleInstance: undefined,
      longTermAverageData: undefined,
      annualCycleData: undefined,
      timeseriesData: undefined,
      statsData: undefined,
    };
  },

  //Use "multistation" instead of the default "multimeta" as the metadata query for this portal.
  getInitialState: function () {
    return {
      metadataQuery: "streamflow/multistation"
    };
  },
  
  
  /*
   * Called when StreamflowDataController is first loaded. Just displays messages
   * telling the user to select a station; data can't be loaded yet.
   */
  getData: function (props) {
    console.log("getData called!");
    console.log("props = ");
    console.log(props);
    if(props.stations.length > 0) {
      this.loadTimeseriesGraph(props);
    }
    else {
      var noStnMsg = "Please select a station on the map";
      this.setTimeSeriesGraphNoDataMessage(noStnMsg);
      this.setStatsTableNoDataMessage(noStnMsg);
    }
  },

  //Removes all data from the Stats Table and displays a message
  setStatsTableNoDataMessage: function(message) {
    this.setState({
      statsTableOptions: { noDataText: message },
      statsData: [],
    });
  },

  //Removes all data from the Timeseries Graph and displays a message
  setTimeSeriesGraphNoDataMessage: function(message) {
    this.setState({
      timeseriesData: { data: { columns: [], empty: { label: { text: message }, }, },
                         axis: {} },
      });
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    // This guards against re-rendering before calls to the data sever alter the
    // state
     return !(_.isEqual(nextState.statsData, this.state.statsData) &&
     _.isEqual(nextState.timeseriesData, this.state.timeseriesData) &&
     _.isEqual(nextProps.meta, this.props.meta) &&
     _.isEqual(nextState.statsTableOptions, this.state.statsTableOptions));
  },
    
  /*
   * This function fetches and loads data for the Timeseries graph.
   * As the Timeseries graph shows all data points at once, there's no
   * filtering or selection done by this function. It will show data for 
   * as many stations as are selected.
   */
  loadTimeseriesGraph: function(props) {

    this.setTimeSeriesGraphNoDataMessage("Loading Data");
    
    var timeseriesPromises = [];
    
    _.each(props.stations, station =>{
      timeseriesPromises.push(this.getFlowseriesPromise(props, station.fileId, station.station));
    });
    
    Promise.all(timeseriesPromises).then(responses => {
      var data = _.pluck(responses, "data");

      this.setState({
        timeseriesData: timeseriesToTimeseriesGraph(props.meta, ...data)
      });
    }).catch(error => {
      this.displayError(error, this.setTimeseriesGraphNoDataMessage);
    });
  },

  /*
   * This function fetches and loads data for the Stats Table. 
   */
  loadDataTable: function (props, time) {
 
    //not implemented yet.
  },

  render: function () {
    var statsData = this.state.statsData ? this.state.statsData : [];
    var timeSeriesData = this.state.timeseriesData ? this.state.timeseriesData : this.blankGraph;

    return (
        <div>
          <h3>{this.props.model_id + ' ' + this.props.variable_id + ' ' + this.props.experiment}</h3>
          <Tabs>
            <TabList>
              <Tab>Streamflow</Tab>
            </TabList>
            <TabPanel>
              <DataGraph data={timeSeriesData.data} axis={timeSeriesData.axis} tooltip={timeSeriesData.tooltip} subchart={timeSeriesData.subchart} line={timeSeriesData.line}/>
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

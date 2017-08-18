/*********************************************************************
 * DualDataController.js - controller component for numerical display
 * of two variables at once.
 * 
 * Receives a model, experiment, and two variables from its parent,
 * DualController. Provides widgets for users to select a specific slice
 * of the data (time of year or run). Queries the API to fetch data on
 * both variables for the viewers it manages, Annual Cycle Graph and 
 * Projected Change Graph, both DataGraphs, to show comparisons of 
 * the two variables.
 * 
 * The main variable is internally referred to as "variable" the 
 * variable being compared to it is the "comparand." Available data
 * is based on the main variable; it's possible to display a dataset with
 * the main variable when the comparand is lacking matching data, 
 * but not vice versa.
 * 
 * Also allows downloading of the data displayed in the graphs.
 *********************************************************************/

import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Button, Row, Col, ControlLabel } from 'react-bootstrap';
import Loader from 'react-loader';
import _ from 'underscore';


import { parseBootstrapTableData} from '../../core/util';
import{ timeseriesToAnnualCycleGraph,
        dataToProjectedChangeGraph} from '../../core/chart';
import DataGraph from '../DataGraph/DataGraph';
import Selector from '../Selector';
import TimeOfYearSelector from '../Selector/TimeOfYearSelector';
import DataControllerMixin from '../DataControllerMixin';

import styles from './DualDataController.css';

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
      projChangeTimeScale: "monthly",
      timeSeriesDatasetId: '',
      climoSeriesData: undefined,
      timeSeriesData: undefined,
      statsData: undefined,
    };
  },

  /*
   * Called when Dual Data Controller is loaded. Loads initial data to 
   * display in the Projected Change graph and the Annual Cycle graph. 
   * Defaults to monthly resolution and January time index.
   * 
   * There's no default for start date, end date, or ensemble member
   * because there's no guarentee specific ones appear in any given
   * data ensemble. These parameters just set to whatever the value are
   * in the first qualifying dataset.
   */
  getData: function (props) {
    
    this.loadDualClimoSeries(props, this.state.projChangeTimeScale, 
        this.state.projChangeTimeOfYear);

    this.loadDualTimeseries(props);    
  },

  //Clear data from the Annual Cycle graph and display a message
  setTimeSeriesNoDataMessage: function(message) {
    this.setState({
      timeSeriesData: { data: { columns: [], empty: { label: { text: message }, }, },
                        axis: {} },
      });
  },

  //Clear data from the Projected Change graph and display a message
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

  /*
   * Called when the user selects a time of year to display on the 
   * Projected Change graph. Redraw the Projected Change graph and
   * store the selected time scale and index in state.
   */
  updateProjChangeTimeOfYear: function (timeidx) {
    var idx = JSON.parse(timeidx).timeidx;
    var scale = JSON.parse(timeidx).timescale;     
    this.loadDualClimoSeries(this.props, scale, idx);
  },

  /*
   * Called when the user selects a specific run to view on the Annual Cycle
   * graph. Stores the selected run and period in state, fetches new data,
   * and updates the graph.
   */
  updateAnnCycleDataset: function (run) {
    this.loadDualTimeseries(this.props, JSON.parse(run));
  },
  
  /*
   * Fetches and loads data for the Projected Change climoseries graph.
   * Loads data for two variables if both props.variable_id and 
   * props.comparand_id are set, else only props.variable_id.  
   */
  loadDualClimoSeries: function (props, timeres, timeidx ) {
    this.setClimoSeriesNoDataMessage("Loading Data");

    //fetch and graph projected change data
    var dataPromises = [];
    var dataParams = [];
    var variableDataParams = _.pick(props, 'model_id', 'experiment', 'area', 'variable_id');
    dataPromises.push(this.getDataPromise(props, timeres, timeidx));
    dataParams.push(variableDataParams);

    //if the user has selected two seperate variables to examine, fetch data
    //for the second variable. This query will always return a result, but
    //the result may be an empty object {}.
    if(props.comparand_id && props.comparand_id != props.variable_id) {
      var comparandDataParams = _.pick(props, 'model_id', 'experiment', 'area');
      comparandDataParams.variable_id = props.comparand_id;
      dataPromises.push(this.getDataPromise(comparandDataParams, timeres, timeidx));
      dataParams.push(comparandDataParams);
    }
    
    Promise.all(dataPromises).then(values=> {
      this.setState({
        projChangeTimeScale: timeres,
        projChangeTimeOfYear: timeidx,
        climoSeriesData: dataToProjectedChangeGraph(_.map(values, function(v){return v.data;}), 
            dataParams), 
      });
    }).catch(error => {
      this.displayError(error, this.setClimoSeriesNoDataMessage);
    });
  },
  
  /*
   * Fetches and loads data for the Annual Cycle graph. Loads data for
   * two variables if props.variable_id and props.comparand_id are both
   * set and different.
   */
  loadDualTimeseries: function (props, run = {}) {
    this.setTimeSeriesNoDataMessage("Loading Data");
    
    var params = {
        model_id: props.model_id,
        variable_id: props.variable_id,
        experiment: props.experiment,
        timescale: "monthly"
    };
    
    //If this functions is supplied with run parameters
    //(an object with ensemble_member, start_date, and end_date attributes), 
    //it will select the matching dataset, otherwise (ie on initial load),
    //a dataset belonging to an arbitrary run will be selected.
    if(run) {
      _.extend(params, run);
    }
    
    var variableMetadata = _.findWhere(props.meta, params);    
    var comparandMetadata = this.findMatchingMetadata(variableMetadata, 
        {variable_id: props.comparand_id}, props.comparandMeta);

    var timeseriesPromises = [];
    
    var variableTimeseriesParams = {variable_id: props.variable_id, area: props.area};
    timeseriesPromises.push(this.getTimeseriesPromise(variableTimeseriesParams, variableMetadata.unique_id));
    
    //we are assured that the required data exists for the primary variable + model + experiment, 
    //but it is not guarenteed to exist for the comparison variable, so fall back to only
    //showing one variable in that case.
    if(comparandMetadata && comparandMetadata.unique_id != variableMetadata.unique_id) {
      var comparandTimeseriesParams = {variable_id: props.comparand_id, area: props.area};
      timeseriesPromises.push(this.getTimeseriesPromise(comparandTimeseriesParams, comparandMetadata.unique_id));
    }
    
    Promise.all(timeseriesPromises).then(series=> {
      var data = _.pluck(series, "data");
      this.setState({
        timeSeriesRun: run,
        timeSeriesData: timeseriesToAnnualCycleGraph([variableMetadata, comparandMetadata], ...data)
        });      
    }).catch(error=>{
      this.displayError(error, this.setTimeSeriesNoDataMessage);
    });    
  },

  render: function () {
    var climoSeriesData = this.state.climoSeriesData ? this.state.climoSeriesData : { data: { columns: [] }, axis: {} };
    var timeSeriesData = this.state.timeSeriesData ? this.state.timeSeriesData : { data: { columns: [] }, axis: {} };
    //make a list of all the unique combinations of run + climatological period
    //a user could decide to view.
    //Not sure JSON is the right way to do this, though.
    //TODO: see if there's a more elegant way to handle the callback
    var ids = this.props.meta.map(function (el) {
        return [JSON.stringify(_.pick(el, 'start_date', 'end_date', 'ensemble_member')),
            `${el.ensemble_member} ${el.start_date}-${el.end_date}`];
    });
    ids = _.uniq(ids, false, function(item){return item[1]});

    var currentDataset = JSON.stringify(this.state.timeseriesRun);
    
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
                <Selector label={"Dataset"} onChange={this.updateAnnCycleDataset} items={ids} value={currentDataset}/>
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
      </div>
    );
  },
});

export default DualDataController;

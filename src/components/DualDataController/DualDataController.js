/*********************************************************************
 * DualDataController.js - controller component for numerical display
 * of two variables at once.
 *
 * Receives a model, experiment, and two variables from its parent,
 * DualController. Provides widgets for users to select a specific slice
 * of the data (timespan or run). Queries the API to fetch data on
 * both variables for the DataGraph viewers it manages, Annual Cycle Graph,
 * Long Term Average Graph, and Timeseries Graph, to show comparisons of
 * the two variables.
 *
 * If a user selects two variables that come from multi year mean datasets,
 * an Annual Graph and a Long Term Average Graph will be displayed. If a
 * user selects two variables that are not multi year means, the less
 * structured Timeseries Graph will be displayed.
 *
 * Selecting one multi year mean dataset and one nominal time dataset
 * displays an error message, as comparing these is not as simple as
 * plotting them on the same graph.
 *
 * The main variable is internally referred to as "variable" the
 * variable being compared to it is the "comparand." Available data
 * is based on the main variable; it's possible to display a dataset with
 * the main variable when the comparand is lacking matching data,
 * but not vice versa.
 *
 * Also allows downloading of the data displayed in the graphs.
 *********************************************************************/

import PropTypes from 'prop-types';

import React from 'react';
import createReactClass from 'create-react-class';
import { Button, Row, Col, ControlLabel, Tab, Tabs } from 'react-bootstrap';
import _ from 'underscore';


import { parseBootstrapTableData,
         timeKeyToResolutionIndex} from '../../core/util';
import{ timeseriesToAnnualCycleGraph,
        dataToLongTermAverageGraph,
        timeseriesToTimeseriesGraph,
        assignColoursByGroup,
        fadeSeriesByRank} from '../../core/chart';
import DataGraph from '../DataGraph/DataGraph';
import Selector from '../Selector';
import TimeOfYearSelector from '../Selector/TimeOfYearSelector';
import DataControllerMixin from '../DataControllerMixin';

import styles from './DualDataController.css';

var DualDataController = createReactClass({
  displayName: 'DualDataController',

  propTypes: {
    ensemble_name: PropTypes.string,
    model_id: PropTypes.string,
    variable_id: PropTypes.string,
    comparand_id: PropTypes.string,
    experiment: PropTypes.string,
    area: PropTypes.string,
    meta: PropTypes.array,
    comparandMeta: PropTypes.array,
  },

  mixins: [DataControllerMixin],

  getInitialState: function () {
    return {
      longTermAverageTimeOfYear: 0,
      longTermAverageTimeScale: "monthly",
      annualCycleDatasetId: '',
      longTermAverageData: undefined,
      annualCycleData: undefined,
      timeseriesData: undefined,
      statsData: undefined,
    };
  },

  /*
   * Called when Dual Data Controller is loaded. Loads initial data to 
   * display in the Long Term Average graph, Timeseries graph, or the 
   * Annual Cycle graph. Defaults to monthly resolution and January time index.
   * 
   * If both datasets are multi year means, the annual cycle graph and
   * long-term average graph will be displayed. If neither dataset is
   * a multi year mean, the timeseries graph will be displayed instead.
   * 
   * There's no default for start date, end date, or ensemble member
   * because there's no guarentee specific ones appear in any given
   * data ensemble. These parameters just set to whatever the value are
   * in the first qualifying dataset.
   */
  getData: function (props) {
    var variableMYM = this.multiYearMeanSelected(props);
    var comparandParams = _.pick(props, 'model_id', 'experiment');
    comparandParams.variable_id = props.comparand_id;
    var comparandMYM = _.findWhere(props.comparandMeta, comparandParams).multi_year_mean;

    if(variableMYM && comparandMYM) {
      this.loadDualLongTermAverageGraph(props, this.state.longTermAverageTimeScale,
          this.state.longTermAverageTimeOfYear);
      this.loadDualAnnualCycleGraph(props);
    }
    else if(!variableMYM && !comparandMYM){
      this.loadDualTimeseriesGraph(props);
    }
    else { //can't compare a multi year mean to a regular timeseries.
      var errorMessage = "Error: this plot cannot compare climatologies to nominal time value datasets.";
      this.setAnnualCycleGraphNoDataMessage(errorMessage);
      this.setLongTermAverageGraphNoDataMessage(errorMessage);
      this.setTimeseriesGraphNoDataMessage(errorMessage);
    }
  },

  //Clear data from the Annual Cycle graph and display a message
  setAnnualCycleGraphNoDataMessage: function(message) {
    this.setState({
      annualCycleData: { data: { columns: [], empty: { label: { text: message }, }, },
                        axis: {} },
      });
  },

  //Clear data from the Long Term Average graph and display a message
  setLongTermAverageGraphNoDataMessage: function(message) {
    this.setState({
      longTermAverageData: { data: { columns: [], empty: { label: { text: message }, }, },
                         axis: {} },
      });
  },

  //Removes all data from the Timeseries Graph and displays a message
  setTimeseriesGraphNoDataMessage: function(message) {
    this.setState({
      timeseriesData: { data: { columns: [], empty: { label: { text: message }, }, },
                         axis: {} },
      });
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    // This guards against re-rendering before calls to the data sever alter the
    // state
     return !(_.isEqual(nextState.longTermAverageData, this.state.longTermAverageData) &&
     _.isEqual(nextState.annualCycleData, this.state.annualCycleData) &&
     _.isEqual(nextState.timeseriesData, this.state.timeseriesData) &&
     _.isEqual(nextProps.meta, this.props.meta) &&
     _.isEqual(nextProps.comparandMeta, this.props.comparandMeta));
  },

  /*
   * Called when the user selects a time of year to display on the 
   * Long Term Average graph. Redraw the Long Term Average graph and
   * store the selected time scale and index in state.
   */
  updateLongTermAverageTimeOfYear: function (index) {
    var time = timeKeyToResolutionIndex(index);
    this.loadDualLongTermAverageGraph(this.props, time.timescale, time.timeidx);
  },

  /*
   * Called when the user selects a specific instance (run + period) to 
   * view on the Annual Cycle graph. Stores the selected run and period 
   * in state, fetches new data, and updates the graph.
   */
  updateAnnualCycleDataset: function (instance) {
    this.loadDualAnnualCycleGraph(this.props, JSON.parse(instance));
  },

  /*
   * Fetches and loads data for the Long Term Average graph.
   * Loads data for two variables if both props.variable_id and 
   * props.comparand_id are set, else only props.variable_id.  
   */
  loadDualLongTermAverageGraph: function (props, timeres, timeidx ) {
    this.setLongTermAverageGraphNoDataMessage("Loading Data");

    //fetch and graph Long Term Average data
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
        longTermAverageTimeScale: timeres,
        longTermAverageTimeOfYear: timeidx,
        longTermAverageData: dataToLongTermAverageGraph(_.map(values, function(v){return v.data;}), 
            dataParams), 
      });
    }).catch(error => {
      this.displayError(error, this.setLongTermAverageGraphNoDataMessage);
    });
  },

  /*
   * Fetches and loads data for the Annual Cycle graph. Loads data for
   * two variables if props.variable_id and props.comparand_id are both
   * set and different.
   */
  loadDualAnnualCycleGraph: function (props, instance = {}) {
    this.setAnnualCycleGraphNoDataMessage("Loading Data");
    
    var params = {
        model_id: props.model_id,
        variable_id: props.variable_id,
        experiment: props.experiment,
        timescale: "monthly"
    };
    
    //If this functions is supplied with instance parameters
    //(an object with ensemble_member, start_date, and end_date attributes), 
    //it will select the matching dataset, otherwise (ie on initial load),
    //a dataset belonging to an arbitrary instance will be selected.
    if(instance) {
      _.extend(params, instance);
    }
    
    var variableMetadata = _.findWhere(props.meta, params);    
    var comparandMetadata = this.findMatchingMetadata(variableMetadata, 
        {variable_id: props.comparand_id}, props.comparandMeta);

    if(_.isEmpty(instance)) {
      instance = _.pick(variableMetadata, "start_date", "end_date", "ensemble_member");
    }

    var timeseriesPromises = [];
    
    var variableTimeseriesParams = {variable_id: props.variable_id, area: props.area};
    timeseriesPromises.push(this.getTimeseriesPromise(variableTimeseriesParams, variableMetadata.unique_id));
    
    //determine whether seasonal and annual resolution data are available for
    //the variable; if so, load them as well.
    _.each(["seasonal", "yearly"], resolution => {
      var resolutionMetadata = this.findMatchingMetadata(variableMetadata, {"timescale": resolution}, props.meta);
      if(resolutionMetadata) {
        timeseriesPromises.push(this.getTimeseriesPromise(variableTimeseriesParams, resolutionMetadata.unique_id));
      }
    });

    //we are assured that the required data exists for the primary variable + model + experiment, 
    //but it is not guarenteed to exist for the comparison variable, so fall back to only
    //showing one variable in that case.
    if(comparandMetadata && comparandMetadata.unique_id != variableMetadata.unique_id) {
      var comparandTimeseriesParams = {variable_id: props.comparand_id, area: props.area};
      timeseriesPromises.push(this.getTimeseriesPromise(comparandTimeseriesParams, comparandMetadata.unique_id));

      //check availability of seasonal and annual data on the comparand,
      //get data promises for them if they exist.
      _.each(["seasonal", "yearly"], resolution => {
        var resolutionMetadata = this.findMatchingMetadata(comparandMetadata, {"timescale": resolution}, props.comparandMeta);
        if(resolutionMetadata) {
          timeseriesPromises.push(this.getTimeseriesPromise(comparandTimeseriesParams, resolutionMetadata.unique_id));
        }
      });

    }

    Promise.all(timeseriesPromises).then(series=> {
      var data = _.pluck(series, "data");

      //generate the graph, then post process it to be a little easier to read.
      var graphMetadata = _.union(props.comparandMeta, props.meta);
      var graph = timeseriesToAnnualCycleGraph(graphMetadata, ...data);

      //function that assigns each data series to one of two groups based on 
      //which variable it represents. Passed to assignColoursByGroup to assign
      //graph line colors.
      var sortByVariable = function (dataSeries) {
        var seriesName = dataSeries[0].toLowerCase();
        if(seriesName.search(props.variable_id) != -1) {
          return 0;
        }
        else if (seriesName.search(props.comparand_id) != -1) {
          return 1;
        }
        else { //if only one variable is selected,
          //it won't be in any series names.
          return seriesName;
        }
      };

      graph = assignColoursByGroup(graph, sortByVariable);

      //function that assigns seasonal and annual timeseries lower "rank"
      //then monthly timeseries. Passed to fadeSeries to make higher-resolution
      //data stand out more.
      var rankByTimeResolution = function(dataSeries) {
        var seriesName = dataSeries[0].toLowerCase();
        if(seriesName.search("monthly") != -1) {
          return 1;
        }
        else if(seriesName.search("seasonal") != -1) {
          return .6;
        }
        else if(seriesName.search("yearly") != -1) {
          return .3;
        }
        //no time resolution indicated in timeseries. default to full rank.
        return 1;
      };

      graph = fadeSeriesByRank(graph, rankByTimeResolution);

      this.setState({
        annualCycleInstance: instance,
        annualCycleData: graph
        });      
    }).catch(error=>{
      this.displayError(error, this.setAnnualCycleGraphNoDataMessage);
    });    
  },

  /*
   * This function fetches and loads data for the Timeseries graph. Will
   * load data for two variables if variable_id and comparand_id are different.
   */
  loadDualTimeseriesGraph: function(props) {

    this.setTimeseriesGraphNoDataMessage("Loading Data");
    var timeseriesPromises = [];

    //primary variable
    var params = _.pick(props, 'model_id', 'variable_id', 'experiment');
    var variableMetadata = _.findWhere(props.meta, params);

    timeseriesPromises.push(this.getTimeseriesPromise(props, variableMetadata.unique_id));

    params.variable_id = props.comparand_id;
    var comparandMetadata = _.findWhere(props.comparandMeta, params);

    //add data from the comparand, if it exists
    if(comparandMetadata && comparandMetadata.unique_id != variableMetadata.unique_id) {
      params.area = props.area;
      timeseriesPromises.push(this.getTimeseriesPromise(params, comparandMetadata.unique_id));
    }

    Promise.all(timeseriesPromises).then(responses => {
      var data = _.pluck(responses, "data");
      var graphMetadata = _.union(props.comparandMeta, props.meta);

      this.setState({
        timeseriesData: timeseriesToTimeseriesGraph(graphMetadata, ...data)
      });
    }).catch(error => {
      this.displayError(error, this.setTimeseriesGraphNoDataMessage);
    });
  },

  render: function () {
    var longTermAverageData = this.state.longTermAverageData ? this.state.longTermAverageData : this.blankGraph;
    var annualCycleData = this.state.annualCycleData ? this.state.annualCycleData : this.blankGraph;
    var timeseriesData = this.state.timeseriesData ? this.state.timeseriesData : this.blankGraph;

    //make a list of all the unique combinations of run + climatological period
    //a user could decide to view.
    //Not sure JSON is the right way to do this, though.
    //TODO: see if there's a more elegant way to handle the callback
    var ids = this.props.meta.map(function (el) {
        return [JSON.stringify(_.pick(el, 'start_date', 'end_date', 'ensemble_member')),
            `${el.ensemble_member} ${el.start_date}-${el.end_date}`];
    });
    ids = _.uniq(ids, false, function(item){return item[1]});

    var selectedInstance;
    _.each(ids, id => {
      if(_.isEqual(JSON.parse(id[0]), this.state.timeseriesInstance)) {
        selectedInstance = id[0];
      }
    });
    
    var annualTab = null, longTermTab = null, timeseriesTab = null;
    if (this.multiYearMeanSelected()) {
      // Annual Cycle Graph
      annualTab = (
        <Tab eventKey={1} title='Annual Cycle'>
          <Row>
            <Col lg={4} lgPush={8} md={6} mdPush={6} sm={6} smPush={6}>
              <Selector label={"Dataset"} onChange={this.updateAnnualCycleDataset} items={ids} value={selectedInstance}/>
            </Col>
            <Col lg={4} lgPush={1} md={6} mdPush={1} sm={6} smPush={1}>
              <div>
                <ControlLabel className={styles.exportlabel}>Download Data</ControlLabel>
                <Button onClick={this.exportAnnualCycle.bind(this, 'xlsx')}>XLSX</Button>
                <Button onClick={this.exportAnnualCycle.bind(this, 'csv')}>CSV</Button>
              </div>
            </Col>
          </Row>
          <DataGraph data={annualCycleData.data} axis={annualCycleData.axis} tooltip={annualCycleData.tooltip} />
        </Tab>
      );

      // Long Term Average Graph
      longTermTab = (
        <Tab eventKey={2} title='Long Term Averages'>
          <Row>
            <Col lg={4} lgPush={8} md={6} mdPush={6} sm={6} smPush={6}>
              <TimeOfYearSelector onChange={this.updateLongTermAverageTimeOfYear} />
            </Col>
            <Col>
              <div>
                <ControlLabel className={styles.exportlabel}>Download Data</ControlLabel>
                <Button onClick={this.exportLongTermAverage.bind(this, 'xlsx')}>XLSX</Button>
                <Button onClick={this.exportLongTermAverage.bind(this, 'csv')}>CSV</Button>
              </div>
            </Col>
          </Row>
          <DataGraph data={longTermAverageData.data} axis={longTermAverageData.axis} tooltip={longTermAverageData.tooltip} />
        </Tab>
      );
    } else {
      // Time Series Graph
      timeseriesTab = (
        <Tab eventKey={3} title='Time Series'>
          <DataGraph data={timeseriesData.data} axis={timeseriesData.axis} tooltip={timeseriesData.tooltip} subchart={timeseriesData.subchart} line={timeseriesData.line} />
          <ControlLabel className={styles.graphlabel}>Highlight a time span on lower graph to see more detail</ControlLabel>
        </Tab>
      );
    }

    return (
      <div>
        <h3>{`${this.props.model_id} ${this.props.experiment}: ${this.props.variable_id} vs ${this.props.comparand_id}`}</h3>
        <Tabs>
          {annualTab}
          {longTermTab}
          {timeseriesTab}
        </Tabs>
      </div>
    );
  },
});

export default DualDataController;
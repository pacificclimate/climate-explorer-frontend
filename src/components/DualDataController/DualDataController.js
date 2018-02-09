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
         timeKeyToResolutionIndex,
         resolutionIndexToTimeKey} from '../../core/util';
import{ timeseriesToAnnualCycleGraph,
        dataToLongTermAverageGraph,
        timeseriesToTimeseriesGraph,
        assignColoursByGroup,
        fadeSeriesByRank} from '../../core/chart';
import DataGraph from '../DataGraph/DataGraph';
import Selector from '../Selector';
import TimeOfYearSelector from '../Selector/TimeOfYearSelector';
import DataControllerMixin from '../DataControllerMixin';
import AnnualCycleGraph from '../graphs/AnnualCycleGraph';
import LongTermAveragesGraph from '../graphs/LongTermAveragesGraph';
import ContextGraph from '../graphs/ContextGraph';
import TimeSeriesGraph from '../graphs/TimeSeriesGraph';

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
    //When switching ensembles, DualDataController is sometimes rendered when
    //the primary variable has been updated to reflect the new ensemble,
    //but the comparand hasn't yet.
    if(props.meta.length > 0 && props.comparandMeta.length < 1) {
      var text = "Loading ensemble";
      this.setLongTermAverageGraphNoDataMessage(text);
      this.setAnnualCycleGraphNoDataMessage(text);
      this.setTimeseriesGraphNoDataMessage(text);
      return;
    }

    var variableMYM = this.multiYearMeanSelected(props);
    var comparandMYM = this.multiYearMeanSelected(this.mockUpComparandProps(props));

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

    //The "data" API endpoint returns data from multiple files at a time,
    //so the metadata needed to generate chart formatting and legends for
    //each series doesn't exactly correspond with the one-file-each entries
    //in props.meta. This function extracts the cross-file metadata
    //corresponding to each query to the "data" endpoint.
    var pickDataParamsFromProps = function(props) {
      return _.pick(props, 'model_id', 'experiment', 'area', 'variable_id');
    }

    //fetch Long Term Average data for the primary variable
    var dataPromises = [];
    var dataParams = [];  //metadata objects for chart formatters

    dataPromises.push(this.getDataPromise(props, timeres, timeidx));
    dataParams.push(pickDataParamsFromProps(props));

    //if the user has selected two seperate variables to examine, fetch data
    //for the second variable. This query will always return a result, but
    //the result may be an empty object {}.
    if(props.comparand_id && props.comparand_id != props.variable_id) {
      dataPromises.push(this.getDataPromise(this.mockUpComparandProps(props), timeres, timeidx));
      dataParams.push(pickDataParamsFromProps(this.mockUpComparandProps(props)));
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
    if(!_.isEmpty(instance)) {
      _.extend(params, instance);
    }
    
    var variableMetadata = _.findWhere(props.meta, params);    
    var comparandMetadata = this.findMatchingMetadata(variableMetadata, 
        {variable_id: props.comparand_id}, props.comparandMeta);

    if(_.isEmpty(instance)) {
      instance = _.pick(variableMetadata, "start_date", "end_date", "ensemble_member");
    }

    var timeseriesPromises = [];
    
    var variableTimeseriesParams = _.pick(props, "variable_id", "area", "meta");
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
      var comparandTimeseriesParams = _.pick(this.mockUpComparandProps(props), "variable_id", "area", "meta");
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

    //secondary variable
    var comparandParams = _.pick(this.mockUpComparandProps(props), 'model_id', 'variable_id', 'experiment');
    var comparandMetadata = _.findWhere(props.comparandMeta, comparandParams);

    //add data from the comparand, iff it exists
    if(comparandMetadata && comparandMetadata.unique_id != variableMetadata.unique_id) {
      timeseriesPromises.push(this.getTimeseriesPromise(this.mockUpComparandProps(props), comparandMetadata.unique_id));
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

  /*
   * This function creates an object that is similar to the props DualDataController
   * receives from its parent, except that the "variable_id" and "meta" attributes
   * describe the secondary variable (comparand) instead of the primary variable.
   *
   * It is passed to mixin functions that normally work with metadata about the
   * primary variable stored from a DataController props object. It allows these methods
   * to operate on DualController's secondary variable as well.
   */
  mockUpComparandProps: function (props = this.props) {
    var mockup = _.omit(props, "meta", "comparandMeta", "variable_id", "comparand_id");
    mockup.meta = props.comparandMeta;
    mockup.variable_id = props.comparand_id;
    return mockup;
  },

  render: function () {
    const longTermAverageSelected = resolutionIndexToTimeKey(
      this.state.longTermAverageTimeScale,
      this.state.longTermAverageTimeOfYear
    );

    return (
      <div>
        <h3>{`${this.props.model_id} ${this.props.experiment}: ${this.props.variable_id} vs ${this.props.comparand_id}`}</h3>
        {
          this.multiYearMeanSelected() ? (
            <Tabs>
              <Tab eventKey={1} title='Annual Cycle'>
                <AnnualCycleGraph
                  meta={this.props.meta}
                  dataset={this.state.annualCycleInstance}
                  onChangeDataset={this.updateAnnualCycleDataset}
                  graphSpec={this.state.annualCycleData || this.blankGraph}
                  onExportXslx={this.exportAnnualCycle.bind(this, 'xlsx')}
                  onExportCsv={this.exportAnnualCycle.bind(this, 'csv')}
                />
              </Tab>
              <Tab eventKey={2} title='Long Term Averages'>
                <LongTermAveragesGraph
                  timeOfYear={longTermAverageSelected}
                  onChangeTimeOfYear={this.updateLongTermAverageTimeOfYear}
                  graphSpec={this.state.longTermAverageData || this.blankGraph}
                  onExportXslx={this.exportLongTermAverage.bind(this, 'xlsx')}
                  onExportCsv={this.exportLongTermAverage.bind(this, 'csv')}
                />
              </Tab>
            </Tabs>
          ) : (
            <Tabs>
              <Tab eventKey={1} title='Time Series'>
                <TimeSeriesGraph
                  graphSpec={this.state.timeseriesData || this.blankGraph}
                />
              </Tab>
            </Tabs>
          )
        }
      </div>
    );
  },
});

export default DualDataController;

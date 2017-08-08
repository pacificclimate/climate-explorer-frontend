/************************************************************************
 * chart.js - provides functions to generate C3-formatted DataGraphs
 * based on the results from the climate explorer backend.
 * 
 * The two primary functions in this file are:
 * - timeseriesToAnnualCycleGraph, which creates graphs to display data 
 *   from the "timeseries" API call with monthly resolution
 * 
 * - dataToProjectedChangeGraph, which creates graphs to display data
 *   from the "data" API call with arbitrary resolution
 * 
 * This file also contains helper functions used by the primary functions
 * to generate pieces of the C3 graph-describing data structure, which is
 * specified here: http://c3js.org/reference.html
 **************************************************************************/

import _ from 'underscore';
import moment from 'moment';
import {PRECISION,
        extendedDateToBasicDate,
        capitalizeWords} from './util';

/*****************************************************
 * 0. Helper functions used by both graph generators *
 *****************************************************/

//Generates a typical y-axis configuration, given the text of the label.
var formatYAxis = function (label) {
  return {
    "label": {
      "text": label,
      "position": "outer-middle"
    },
    "tick": {
      "format": numberFormatFunction
    },
    "show": true
  };
};

//Simple formatting function for numbers to be displayed on the graph.
var numberFormatFunction = function (n) { return +n.toFixed(PRECISION);};

/*
 * This function returns a number-formatting function for use by the C3
 * tooltip.
 * C3 passes the tooltip formatting function four pieces of information about the 
 * datum being examined: data value, ratio (pie charts only), series id, 
 * and point index within the series.
 *
 * This function extracts unit names for each data series from the axis
 * labels, then returns a function that uses the series id passed by 
 * C3 to append a units string to each value.
 */
var tooltipDisplayNumbersWithUnitsFunction = function(axes, axis) {
  var unitsDictionary = {};
  
  //build a dictionary between timeseries names and units
  for(var series in axes) {
    unitsDictionary[series] = axis[axes[series]].label.text;
  }
 
  return function(value, ratio, id, index) {
    return `${numberFormatFunction(value)} ${unitsDictionary[id]}`;
  };
}

/**************************************************************
 * 1. timeseriesToAnnualCycleGraph() and its helper functions *
 **************************************************************/

/* timeseriesToAnnualCycleGraph()
 * This function takes one or more JSON objects from the 
 * "timeseries" API call with this format:
 * 
 * {
 * "id": "tasmax_mClim_BCCAQv2_bcc-csm1-1-m_historical-rcp45_r1i1p1_20700101-20991231_Canada",
 * "units": "degC",
 * "data": {
 *   "2085-01-15T00:00:00Z": -17.498223073165622,
 *   "2085-02-15T00:00:00Z": -15.54878007851129,
 *   "2085-03-15T00:00:00Z": -11.671093808333737,
 *                    ...
 *    }
 * }
 * 
 * along with an array of dataset metadata entries that includes each
 * dataset referenced by the "id" field in the API results and return 
 * a C3 graph object displaying all the timeseries.
 * 
 * It takes an arbitrary number of data objects, but no more than
 * two separate unit types. Allowable data resolutions are monthly(12), 
 * seasonal (4), or yearly (1); an error will be thrown 
 * if this function is called on data with another time resolution.
 */
var timeseriesToAnnualCycleGraph = function(metadata, ...data) {

  //blank graph data object to be populated - holds data values
  //and individual-timeseries-level display options.
  var c3Data = {
      columns: [],
      types: {},
      labels: {},
      axes: {}
  };

  var yUnits = "";
  var y2Units = "";
  
  var getTimeseriesName = shortestUniqueTimeseriesNamingFunction(metadata, data);
  
  //Add each timeseries to the graph
  for(var i = 0; i < data.length; i++) {

    //get metadata for this timeseries
    var timeseries = data[i];
    var timeseriesMetadata = _.find(metadata, function(m) {return m.unique_id === timeseries.id;});  
    var timeseriesName = getTimeseriesName(timeseriesMetadata);
       
    //add the actual data to the graph
    c3Data.columns.push([timeseriesName].concat(getMonthlyData(timeseries.data, timeseriesMetadata.timescale)));
    
    //monthly data is displayed as a line graph, but yearly and seasonal
    //display as step graphs.
    c3Data.types[timeseriesName] = timeseriesMetadata.timescale == "monthly" ? "line" : "step";

    //Each timeseries needs to be associated with a y-axis.
    //Two different variables measured with the same units, 
    //like tasmin (degrees C) and tasmax (degrees C)
    //can share a y-axis. 
    //Variables with different units require seperate axes.
    //C3 can theoretically support indefinite numbers of y-axes,
    //but that would be hard for a user to make sense of, 
    //so it's capped at two here.
    if((!yUnits) || timeseries.units == yUnits) {
      yUnits = timeseries.units;
      c3Data.axes[timeseriesName] = "y";
    }
    else if((!y2Units) || timeseries.units == y2Units) {
      y2Units = timeseries.units;
      c3Data.axes[timeseriesName] = "y2";
    }
    else {
      throw new Error("Error: too many data axes required for graph");
    }
  }
  
  //whole-graph display options: axis formatting and tooltip behaviour
  var c3Axis = {};
  c3Axis.x = monthlyXAxis;
  c3Axis.y = formatYAxis(yUnits);
  if(y2Units) { 
    c3Axis.y2 = formatYAxis(y2Units);
    }
    
  var c3Tooltip = {format: {}};
  c3Tooltip.grouped = "true";
  c3Tooltip.format.value = tooltipDisplayNumbersWithUnitsFunction(c3Data.axes, c3Axis);
  
  return {
    data: c3Data,
    tooltip: c3Tooltip,
    axis: c3Axis
  }; 
};

/*
 * Helper function for timeseriesToAnnualCycleGraph.
 * Accepts a dataseries object with 1, 4, or 12 timestamp:value pairs
 * and returns an array with twelve values in order by timestamp,
 * repeating values as necessary to get a monthly-resolution sequence.
 */
var getMonthlyData = function(data, timescale = "monthly") {

  var expectedTimestamps = {"monthly": 12, "seasonal": 4, "yearly": 1};
  var monthlyData = [];
  var timestamps = Object.keys(data).sort();
  
  if(timestamps.length == 17) {
    throw new Error("Error: concatenated 17-point chronology.");
  }
  
  if(timestamps.length != expectedTimestamps[timescale]) {
    throw new Error("Error: inconsistent time resolution in data");
  }
  
  for(var i = 0; i < 12; i++) {
    var mapped = Math.ceil((timestamps.length / 12.0) * (i + 1)) - 1;
    monthlyData.push(data[timestamps[mapped]]);
  }
  
  //Seasonal timeseries need one month of winter removed from the beginning of the
  //year and added at the end, since winter wraps around the calendar new year.
  if(timescale == "seasonal") {
    monthlyData = monthlyData.slice(1, 12);
    monthlyData.push(data[timestamps[0]]);
  }
  
  return monthlyData;
};

/*
 * Helper function for timeseriesToAnnualCycleGraph. Given a set of timeserieses 
 * to be graphed and metadata about each timeseries, returns a function 
 * that generates the shortest name necessary to distinguish a particular
 * timeseries from all others being shown on the same chart.
 * 
 * For example, when graphing monthly, seasonal, and yearly means for 
 * otherwise identical data run, only "monthly", "seasonal," and "yearly"
 * need to appear in the graph legend. But if graphing multiple variables,
 * the graph legend will need to display variable names as well.
 * 
 * Timeseries names include any descriptive  metadata that vary between 
 * timeseries and leave out any metadata that doesn't. They end with "mean".
 */
//TODO: special case climatological period to display as (XXXX-XXXX)
//TODO: possibly cue descriptors to appear in a specific order?
// "Tasmin Monthly Mean" sounds better than "Monthly Tasmin Mean".
var shortestUniqueTimeseriesNamingFunction = function (metadata, data) {
  
  //only one timeseries being graphed, simple label.
  if(data.length == 1) {
    return function(m) { return capitalizeWords(`${m.timescale} mean`)};
  }
  
  var variation = [];
  var exemplarMetadata = _.find(metadata, function(m) {return m.unique_id === data[0].id;});
  
  for(var i = 0; i < data.length; i++) {
    var comparandMetadata = _.find(metadata, function(m) {return m.unique_id == data[i].id});
    
    for(var att in comparandMetadata) {
      if(exemplarMetadata[att] !== comparandMetadata[att] && variation.indexOf(att) == -1) {
        variation.push(att);
      }
    }
  }
  
  //Remove unique_id from the list of possible variations. All
  //datasets have unique unique_id's; it's not useful on a graph
  variation.splice(variation.indexOf("unique_id"), 1);
  
  //Remove variable_name if variable_id is present, since we don't need both
  if(variation.indexOf("variable_name") != -1 && variation.indexOf("variable_id" != -1)) {
    variation.splice(variation.indexOf("variable_name"), 1);
  }
  
  if(variation.length == 0) {
    throw new Error("Error: cannot graph identical timeseries");
  }
  
  return function (m) {
    var name = "";
    for(var j = 0; j < variation.length; j++) {
      name = name.concat(`${m[variation[j]]} `);
    }
    name = name.concat("mean");
    return capitalizeWords(name);
  };
};

/* 
 * Helper constant for timeseriesToAnnualCycleGraph: an X-axis configuration 
 * object representing a categorical axis labeled in months.
 */
var monthlyXAxis = {
    type: 'category',
    categories: ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December']
};

/************************************************************
 * 2. dataToProjectedChangeGraph() and its helper functions *
 ************************************************************/

/* dataToProjectedChangeGraph()
 * This function takes an array containins one or more JSON objects 
 * from the "data" API call with this format:
 * 
 * {
 *   "r1i1p1": {
 *     "data": {
 *       "1997-01-15T00:00:00Z": -19.534196834187902,
 *       "2055-01-15T00:00:00Z": -17.825752320828578,
 *       "1977-01-15T00:00:00Z": -20.599000150601793,
 *                    ...
 *       },
      "units": "degC"
 *   }
 * "r2i1p1":  {
 *           .........
 *  },
 *}
 * 
 * and returns a C3 graph object displaying them.
 * 
 * It takes an array containing an arbitrary number of data objects, each 
 * containing an arbitrary number of runs, but no more than two separate 
 * unit types. 
 * 
 * If there is more than one data object, an array of context objects is 
 * needed as well, because the data API call returns no metadata beyond run 
 * names. It's possible that two different datasets would share a run
 * name, and would appear identically on the graph, so additional context 
 * is needed to to differentiate.
 * Each context object provides the attributes that were passed to the 
 * API to generate the data object at the same array position. 
 * For example:
 * {
 *   model_id: bcc-csm1-1-m
 *   variable_id: tasmax
 *   experiment: historical,+rcp45
 *   area: undefined
 * }
 * 
 * The context objects are used in the graph legend, to distinguish runs
 * with the same name ("r1i1p1") from different datasets.
 */
var dataToProjectedChangeGraph = function(data, contexts = []){

  //blank graph data object to be populated - holds data values
  //and individual-timeseries-level display options.
  var c3Data = {
      columns: [],
      types: {},
      labels: {},
      axes: {}
  };
  
  var yUnits = "";
  var y2Units = "";
  
  var nameSeries;
  
  if(data.length == 1) {
    nameSeries = function(run, context) {return run};
  }
  else if(data.length == contexts.length) {
    nameSeries = nameAPICallParametersFunction(contexts);
  }
  else {
    throw new Error("Error: no context provided for timeseries data");
  }
  
  //get the list of all timestamps and add them to the chart
  //(C3 requires x-axis timestamps be added as a data column)
  var timestamps = getAllTimestamps(data);
  c3Data.columns.push(['x'].concat(_.map(timestamps, extendedDateToBasicDate)));
  c3Data.x = "x";
  

  //add each API call to the chart
  for(var i = 0; i < data.length; i++) {
    var context = contexts.length ? contexts[i] : {};
    var call = data[i];
    
    //add each individual dataset from the API to the chart
    for(let run in call) {
      var runName = nameSeries(run, context);
      var series = [runName];
      
      //if a given timestamp is present in some, but not all
      //datasets, that timestamp's value will be "undefined"
      //in the C3 data object. This will cause C3 to render the
      //line with a break where the missing timestamp is.
      for(var t = 0; t < timestamps.length; t++ ) {
        series.push(call[run].data[timestamps[t]]);
      }
      c3Data.columns.push(series);
      c3Data.types[runName] = "line";
      
      //Each line on the graph needs to be associated with a y-axis
      //and a y-scale. Datasets that share units (like tasmax and tasmin)
      //can be graphed on the same y-axis, but datasets with
      //different units (like tasmax and precipitation) need seperate
      //y-axes. While in theory C3 supports an arbitrary number of
      //axes, more than two is hard for a user to make sense of,
      //so this function only supports up to two y-axes.
      if((!yUnits) || call[run].units == yUnits) {
        yUnits = call[run].units;
        c3Data.axes[runName] = "y";
      }
      else if((!y2Units) || call[run].units == y2Units) {
        y2Units = call[run].units;
        c3Data.axes[runName] = "y2";
      }
      else {
        throw new Error("Error: too many data axes required for graph");
      }
    }
  }
  
  //whole-graph display options: axis formatting and tooltip behaviour
  var c3Axis = {};
  c3Axis.x = timeseriesXAxis;
  c3Axis.y = formatYAxis(yUnits);
  if(y2Units) { 
    c3Axis.y2 = formatYAxis(y2Units);
    }
    
  var c3Tooltip = {format: {}};
  c3Tooltip.grouped = "true";
  c3Tooltip.format.value = tooltipDisplayNumbersWithUnitsFunction(c3Data.axes, c3Axis);
  
  return {
    data: c3Data,
    tooltip: c3Tooltip,
    axis: c3Axis
  }; 
};

/*
 * Helper function for dataToProjectedChangeGraph. Extracts the
 * list of all unique timestamps found in the data.
 */
var getAllTimestamps = function(data) {
  var allTimes = [];
  
  for(var i = 0; i < data.length; i++) {
    for(let run in data[i]) {
      for(let timestamp in data[i][run].data) {
        if(!_.find(allTimes, function(t){return t == timestamp;})) {
          allTimes.push(timestamp);
        }
      }
    } 
  }
  if (allTimes.length == 0) {
    throw new Error("Error: no time stamps in data");
  }
  return allTimes;
};

/* 
 * Helper function for dataToProjectedChangeGraph. Examines
 * the query context for multiple API calls to the "data" 
 * API and determines which possible query parameters 
 * (model, variable, emission, or timescale) vary by query.
 * 
 * Returns a function that prefixes the "run" parameter
 * from each API call with the parameters that vary between that 
 * specific run's call and other calls being graphed at the same time. 
 * Example: "tasmax r1i1p1" vs "pr r1i1p1"
 */
var nameAPICallParametersFunction = function(contexts) {
  
  var variation = [];
  var exemplarContext = contexts[0];
  
  for (var i = 0; i < contexts.length; i++) {
    for(var att in contexts[i]) {
      if(exemplarContext[att] != contexts[i][att] && variation.indexOf(att) == -1) {
        variation.push(att);
      }
    }
  }
  
  //"data" API was called more than once with the same arguments -
  // probably a mistake.
  if(variation.length == 0) {
    throw new Error("Error: cannot graph two identical queries");
  }
  
  //an "area" is just a list of points. The naive algorithm used to generate
  //data series names here would just display the entire list next to each 
  //data series in the graph legend, which would be unhelpful, and an invalid 
  //series name as far as C3 is concerned. At present, throw an error 
  //if attempting to graph data series associated with different areas. If 
  //this functionality is needed in the future, it can be implemented here.
  if(variation.indexOf("area") != -1) {
    throw new Error("Error: cannot display two datasets associated with different areas.");
  }
  
  return function (run, context) {
    var name = "";
    for(var j = 0; j < variation.length; j++) {
      name = name.concat(`${context[variation[j]]} `);
    }
    name = name.concat(run);
    return name;
  };  
};

/*
 * Helper constant for dataToProjectedChangeGraph: Format object 
 * for a timeseries X axis.
 */
var timeseriesXAxis = {
    type: 'timeseries',
    tick: {
      format: '%Y-%m-%d'
    }
};

module.exports = { timeseriesToAnnualCycleGraph, dataToProjectedChangeGraph,
    //exported only for testing purposes:
    formatYAxis, numberFormatFunction, tooltipDisplayNumbersWithUnitsFunction,
    timeseriesToAnnualCycleGraph, getMonthlyData, shortestUniqueTimeseriesNamingFunction,
    dataToProjectedChangeGraph, getAllTimestamps, nameAPICallParametersFunction};
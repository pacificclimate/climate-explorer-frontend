/************************************************************************
 * chart.js - provides functions to generate C3-formatted DataGraphs
 * based on the results from the climate explorer backend.
 * 
 * The two primary functions in this file are:
 * - timeseriesToAnnualCycleGraph, which creates graphs to display data 
 *   from the "timeseries" API call with monthly resolution
 * 
 * - dataToLongTermAverageGraph, which creates graphs to display data
 *   from the "data" API call with arbitrary resolution
 * 
 * This file also contains helper functions used by the primary functions
 * to generate pieces of the C3 graph-describing data structure, which is
 * specified here: http://c3js.org/reference.html.
 *
 * timeseriesToTimeseriesGraph() generates a graph that has things in common
 * with each of the primary graphs, and post-processing functions to
 * fine-tune display parameters on an already-existant graph.
 **************************************************************************/

import _ from 'underscore';
import {PRECISION,
        extendedDateToBasicDate,
        capitalizeWords,
        caseInsensitiveStringSearch,
        nestedAttributeIsDefined,
        getVariableOptions} from './util';
import chroma from 'chroma-js';

/*****************************************************
 * 0. Helper functions used by all graph generators *
 *****************************************************/

//Generates a typical y-axis configuration, given the text of the label.
var formatYAxis = function (label) {
  return {
    "label": {
      "text": label,
      "position": "outer-middle"
    },
    "tick": {
      "format": fixedPrecision
    },
    "show": true
  };
};

/*
 * Simple formatting function for numbers to be displayed on the graph.
 * Used as a default when a more specialized formatting function isn't
 * available; ignores all its inputs except the number to be formatted.
 */
var fixedPrecision = function (n, ...rest) { return +n.toFixed(PRECISION);};

/*
 * Accepts a object with seriesname:variable pairs.
 * Returns a function that accepts a number and a series name, and formats
 * the number according to precision set in the variable-options.yaml config
 * file for the associated variable, or a default precision with
 * util.PRECISION for variables with no precision options in the file.
 */
var makePrecisionBySeries = function (series) {
  var dictionary = {};
  for(var s in series) {
    var fromConfig = getVariableOptions(series[s], "decimalPrecision");
    dictionary[s] = _.isUndefined(fromConfig) ? PRECISION : fromConfig;
  }

  return function(n, series) {return +n.toFixed(dictionary[series])};
};

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
 *
 * It optionally accepts a precisionFunction for more exact formatting of
 * numbers. precisionFunction will be passed the number to format and the
 * series id it belongs to.
 */
var makeTooltipDisplayNumbersWithUnits = function(axes, axis, precisionFunction) {
  var unitsDictionary = {};
  if(_.isUndefined(precisionFunction)) { //use a default.
    precisionFunction = fixedPrecision;
  }
  
  //build a dictionary between timeseries names and units
  for(var series in axes) {
    unitsDictionary[series] = axis[axes[series]].label.text;
  }

  return function(value, ratio, id, index) {
    return `${precisionFunction(value, id)} ${unitsDictionary[id]}`;
  };
};

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
  var seriesVariables = {};
  
  var getTimeseriesName = shortestUniqueTimeseriesNamingFunction(metadata, data);
  
  //Add each timeseries to the graph
  for(var i = 0; i < data.length; i++) {

    //get metadata for this timeseries
    var timeseries = data[i];
    var timeseriesMetadata = _.find(metadata, function(m) {return m.unique_id === timeseries.id;});  
    var timeseriesName = getTimeseriesName(timeseriesMetadata);
    seriesVariables[timeseriesName] = timeseriesMetadata.variable_id;
       
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

  var precision = makePrecisionBySeries(seriesVariables);
  var c3Tooltip = {format: {}};
  c3Tooltip.grouped = "true";
  c3Tooltip.format.value = makeTooltipDisplayNumbersWithUnits(c3Data.axes, c3Axis, precision);
  
  return {
    data: c3Data,
    tooltip: c3Tooltip,
    axis: c3Axis,
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
 * otherwise identical data files, only "monthly", "seasonal," and "yearly"
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
  if (metadata.length === 0) {
    throw new Error('No data to show');
  }
  
  //only one timeseries being graphed, simple label.
  if(data.length == 1) {
    return function(m) { return capitalizeWords(`${m.timescale} mean`);};
  }
  
  var variation = [];
  var exemplarMetadata = _.find(metadata, function(m) {return m.unique_id === data[0].id;});
  
  for(var i = 0; i < data.length; i++) {
    var comparandMetadata = _.find(metadata, function(m) {return m.unique_id == data[i].id;});

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
  
  if(variation.length === 0) {
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
 * 2. dataToLongTermAverageGraph() and its helper functions *
 ************************************************************/

/* dataToLongTermAverageGraph()
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
var dataToLongTermAverageGraph = function(data, contexts = []){

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
  
  var seriesVariables = {};
  var nameSeries;
  
  if(data.length == 1) {
    nameSeries = function(run, context) {return run;};
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
      seriesVariables[runName] = _.isEmpty(context) ? undefined : context.variable_id;
      var series = [runName];
      
      //if a given timestamp is present in some, but not all
      //datasets, set the timestamp's value to "null"
      //in the C3 data object. This will cause C3 to render the
      //line with a break where the missing timestamp is.
      for(var t = 0; t < timestamps.length; t++ ) {
        series.push(_.isUndefined(call[run].data[timestamps[t]]) ? null : call[run].data[timestamps[t]]);
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

  //The long term average graph doesn't require every series to have the exact
  //same timestamps, since it's comparing long term trends anyway. Allow C3
  //to smoothly connect series even if they're "missing" timestamps.
  var c3Line = {
      connectNull: true
  };

  //Note: if context is empty (dataToLongTermAverageGraph was called with only
  //one time series), variable-determined precision will not be available and
  //numbers will be formatted with default precision.
  var precision = makePrecisionBySeries(seriesVariables);
  var c3Tooltip = {format: {}};
  c3Tooltip.grouped = "true";
  c3Tooltip.format.value = makeTooltipDisplayNumbersWithUnits(c3Data.axes, c3Axis, precision);
  
  return {
    data: c3Data,
    tooltip: c3Tooltip,
    axis: c3Axis,
    line: c3Line
  }; 
};

/*
 * Helper function for dataToLongTermAverageGraph. Extracts the
 * list of all unique timestamps found in the data.
 */
var getAllTimestamps = function(data) {
  var allTimes = [];

  var addSeries = function(seriesData) {
    for(let timestamp in seriesData) {
      if(!_.find(allTimes, function(t){return t== timestamp;})) {
        allTimes.push(timestamp);
      }
    }
  };

  for(var i in _.keys(data)) {
    if(!_.isUndefined(data[i].data)) { //data is from "timeseries" API
      addSeries(data[i].data);
    }
    else { //data is from "data" API
      for(let run in data[i]) {
        addSeries(data[i][run].data);
      }
    }
  }
  if (allTimes.length === 0) {
    throw new Error("Error: no time stamps in data");
  }
  return allTimes;
};

/* 
 * Helper function for dataToLongTermAverageGraph. Examines
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
  if(variation.length === 0) {
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
 * Helper constant for dataToLongTermAverageGraph: Format object 
 * for a timeseries X axis.
 */
var timeseriesXAxis = {
    type: 'timeseries',
    tick: {
      format: '%Y-%m-%d'
    }
};

/**************************************************************
 * 3. timeseriesToTimeseriesGraph
 **************************************************************/

/* 
 * timeseriesToTimeseriesGraph()
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
 * dataset referenced by the "id" field in the API results. It returns
 * a C3 graph object displaying each data object as a series.
 *
 * The graph produced by this function is intermediate between the
 * Annual Cycle graph and the Long Term Average graph, and uses a mixed
 * set of helper functions. It builds a chart from the same query and
 * data format as the Annual Cycle data, but produces an open-ended
 * timeseries with an arbitrary number of points and dates along the X
 * axis instead of a yearly cycle.
 *
 * Features a selectable "subchart" to let users zoom in to a smaller
 * scale, since data on this chart can consists of a very large
 * number of points. (monthly data 1950-2100 = 1800 points).
 *
 * Accepts an arbitrary number of data objects, but no more than
 * two separate unit types.
 */
var timeseriesToTimeseriesGraph = function(metadata, ...data) {
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
  var seriesVariables = {};

  var getTimeseriesName = shortestUniqueTimeseriesNamingFunction(metadata, data);

  //get list of all timestamps
  var timestamps = getAllTimestamps(data);
  c3Data.columns.push(['x'].concat(_.map(timestamps, extendedDateToBasicDate)));
  c3Data.x = "x";

  //Add each timeseries to the graph
  for(var i = 0; i < data.length; i++) {
    //get metadata for this timeseries
    var timeseries = data[i];
    var timeseriesMetadata = _.find(metadata, function(m) {return m.unique_id === timeseries.id;});
    var timeseriesName = getTimeseriesName(timeseriesMetadata);
    seriesVariables[timeseriesName] = timeseriesMetadata.variable_id;

    //add the actual data to the graph
    var column = [timeseriesName];

    for(var t = 0; t < timestamps.length; t++ ) {
      //assigns "null" for any timestamps missing from this series.
      //C3's behaviour toward null values is set by the line.connectNull attribute
      column.push(_.isUndefined(timeseries.data[timestamps[t]]) ? null : timeseries.data[timestamps[t]]);
    }

    c3Data.columns.push(column);
    c3Data.types[timeseriesName] = "line";

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
  c3Axis.x = timeseriesXAxis;
  c3Axis.y = formatYAxis(yUnits);
  if(y2Units) {
    c3Axis.y2 = formatYAxis(y2Units);
    }

  var c3Subchart = {show: true,
      size: {height: 20} };

  //instructs c3 to connect series across gaps where a timeseries is missing
  //a timestamp. While this could be confusing in cases where a datapoint
  //is actually missing from a series, it's helpful in cases where
  //series are at different time resolutions (monthly/yearly), so it's
  //included by default.
  var c3Line = {
      connectNull: true
  };

  var precision = makePrecisionBySeries(seriesVariables);
  var c3Tooltip = {format: {}};
  c3Tooltip.grouped = "true";
  c3Tooltip.format.value = makeTooltipDisplayNumbersWithUnits(c3Data.axes, c3Axis, precision);

  return {
    data: c3Data,
    subchart: c3Subchart,
    tooltip: c3Tooltip,
    axis: c3Axis,
    line: c3Line
  }; 
};

/**************************************************************
 * 4. Post-processing functions to refine generated graphs
 **************************************************************/

/*
 * Reiteration of D3's "category10" colors. They underlie c3's default
 * colours but are not directly accessible. Allows creating custom
 * colour palettes that use the same colors as the default assignments.
 */

var category10Colours = ["#1f77b4",
                         "#ff7f03",
                         "#2ca02c",
                         "#d62728",
                         "#9467bd",
                         "#8c564b",
                         "#e377c2",
                         "#7f7f7f",
                         "#bcbd22",
                         "#17becf"];


/*
 * Post-processing graph function that assigns shared colours to
 * related data series.
 *
 * Accepts a C3 graph object and a segmentation function. Applies the
 * segmentation function to each data column in the graph object. All
 * data columns that evaluate to the same result are grouped together
 * and assigned the same display colour.
 *
 * Returns a modified graph object with colours assigned in graph.data.colors
 * accordingly.
 *
 * _.isEqual() is used to evaluate whether two segmentation results are equal.
 * Each data column is an array with the series name in the 0th location, example:
 *
 * ['Monthly Mean Tasmin', 30, 20, 50, 40, 60, 50, 10, 10, 20, 30, 40, 50]
 *
 */
var assignColoursByGroup = function (graph, segmentor, colourList = category10Colours) {
  var categories = [];
  var colors = {};

  _.each(graph.data.columns, column => {
    var seriesName = column[0];
    if(!_.isEqual(seriesName, "x")) { //"x" series used to provide categories, not data.
      var category = segmentor(column);
      var index = _.indexOf(categories, category);
      if(index == -1) {
        //first time we've encountered this category,
        //add it to the list.
        categories.push(category);
        if(categories.length > colourList.length) {
          throw new Error("Error: too many data categories for colour palette");
        }
        index = categories.length - 1;
      }
      colors[seriesName] = colourList[index];
    }
  });
  graph.data.colors = colors;
  return graph;
};

/*
 * Post-processing graph function that visually de-emphasizes certain
 * data series by lightening their assigned colour. (Assumes the graph
 * has a white background, otherwise lightening isn't de-emphasizing.)
 *
 * Accepts a C3 graph object and a ranking function. The ranking function
 * will be applied to each data column in the graph object, and should
 * output a number between 0 and 1, which will be used to determine the
 * visual prominence of the associated data series. Series ranked 1 will
 * be drawn normally with their assigned colour, values less than one and
 * greater than zero will be lightened proportionately. A data series ranked
 * 0 by the ranking function will be drawn in white.
 *
 * Returns the graph object, modified by the addition of a data.color
 * function to operate on assigned series colours.
 * Each data column passed to the ranking function is an array like this:
 *
 * ['Monthly Mean Tasmin', 30, 20, 50, 40, 60, 50, 10, 10, 20, 30, 40, 50]
 */
var fadeSeriesByRank = function (graph, ranker) {

  var rankDictionary = {};

  _.each(graph.data.columns, column => {
    var seriesName = column[0];
    if(!_.isEqual(seriesName, "x")) {
      rankDictionary[seriesName] = ranker(column);
    }
  });

  //c3 will pass the function the assigned colour, and either:
  //     * a string with the name of the time series (drawing legend)
  //     * an object with attributes about the time series (drawing a point or line)
  var fader = function(colour, d) {
    var scale = chroma.scale(['white', colour]);
    if(_.isObject(d)) { //d = data attributes
      return scale(rankDictionary[d.id]).hex();
    }
    else { //d = series name only
      return scale(rankDictionary[d]).hex();
    }
  };

  graph.data.color = fader;
  return graph;
};

/*
 * Post-processing graph function that removes data series from the legend.
 *
 * Accepts a C3 graph and a predicate function. Applies the predicate to
 * each data series. If the predicate returns true, the data series will
 * be hidden from the legend. If the predicate returns false, the data series
 * will appear in the legend as normal.
 *
 * By default, every data series appears in the legend; this postprocessor
 * is only needed if at least one series should be hidden.
 */
var hideSeriesInLegend = function(graph, predicate) {
  var hiddenSeries = [];

  _.each(graph.data.columns, column => {
    var seriesName = column[0];
    if(!_.isEqual(seriesName, "x")) {
      if(predicate(column)){
        hiddenSeries.push(seriesName);
      }
    }
  });

  if(!graph.legend) {
    graph.legend = {};
  }

  graph.legend.hide = hiddenSeries;
  return graph;
};

/*
 * Post-processing graph function that sets the order of the data series.
 * The last-drawn series is the most clearly visible; its points and lines
 * will be on top where they intersect with other series.
 *
 * Accepts a C3 graph and a ranking function. The ranking function will be
 * applied to each series in the graph, and the series will be sorted by the
 * ranking function's results. The higher a series is ranked, the later it
 * will be drawn and the more prominent it will appear.
 */
var sortSeriesByRank = function(graph, ranker) {
  var sorter = function(a, b) {return ranker(a) - ranker(b);}
  graph.data.columns = graph.data.columns.sort(sorter);
  return graph;
}

/*
 * Post-processing graph function that accepts two keywords (x and y) and a graph
 * containing one or more pairs of timeseries and combines pairs of matching time 
 * series into a variable response graph.
 * 
 * Each data series should match exactly one other series. In order to match, two 
 * data series must:
 *   - have names that are identical except for the substitution of x for y
 *   - have data at all the same timestamps
 * 
 * This function combines each pair of matching data series into a new data series. For
 * each (time, data) tuple present in both original time series, it creates a new
 * (data-x, data-y) tuple, using the series with the x keyword as the x coordinate
 * and the series with the y keyword as the y coordinate.
 *
 * The axis labels of the new graph will be generated from the y axis label(s) of the
 * old graph.
 *
 * Example:
 * x: pr
 * y: tasmax
 * chart with data.columns:
 * ["Monthly pr", 10, 20, 30, 40, 50 ]
 * ["Monthly tasmax", 1, 2, 3, 4, 5 ]
 * ["x", 1/1/15, 1/2/15, 1/3/15, 1/4/15, 1/5/15]
 * 
 * Would result in a new chart with data.columns:
 * ["x", 10, 20, 30, 40, 50]
 * ["pr", 1, 2, 3, 4, 5]
 * 
 * This is intended to graph the effect of one variable (x) on another (y).
 */
var makeVariableResponseGraph = function(x, y, graph) {
  let c3Data = {};

  const seriesNameContains = function (series, keyword) {
    return caseInsensitiveStringSearch(series[0], keyword);
  }
  
  const xseries = _.filter(graph.data.columns, series => seriesNameContains(series, x));
  const yseries = _.filter(graph.data.columns, series => seriesNameContains(series, y));
    
  let tuples = [];
  
  for(let i = 0; i < xseries.length; i++) {
    //Try to match each dependent variable series with an independent variable series
    let dependent = xseries[i];
    let independent = _.find(yseries, series => {
      return series[0].toLowerCase().replace(y.toLowerCase(), x.toLowerCase()) === 
        dependent[0].toLowerCase();
      });
    for(let d = 1; d < dependent.length; d++) {
      if(!_.isNull(dependent[d]) && !_.isNull(independent[d])) {
        tuples.push([independent[d], dependent[d]]);
      }
    }
  }
  //sort by x value, preperatory to putting on the graph.
  tuples.sort((a, b) => a[0] - b[0]);  
  c3Data.columns = [["x"], [y]];


  for(let i = 1; i < tuples.length; i++) {
    c3Data.columns[0].push(tuples[i][0]);
    c3Data.columns[1].push(tuples[i][1]);
    //C3 doesn't really support scatterplots, but we can fake it by adding
    //a missing data point between each actual data point, and instructing C3
    //not to connect across missing data points with {connectNull: false} 
    if(i < tuples.length - 1) {
      c3Data.columns[0].push((tuples[i][0] + tuples[i+1][0])/2);
      c3Data.columns[1].push(null);
    }
  }

  // Generate x and y axes. Reuse labels from source graph,
  // but add variable names if not present.
  let xAxisLabel = getAxisTextForVariable(graph, x);
  xAxisLabel = xAxisLabel.search(x) === -1 ? `${x} ${xAxisLabel}` : xAxisLabel;
  const xAxis = {
      tick: {
        count: 8,
        fit: true,
        format: fixedPrecision
      },
      label: xAxisLabel
    };

  let yAxisLabel = getAxisTextForVariable(graph, y);
  yAxisLabel = yAxisLabel.search(y) === -1 ? `${y} ${yAxisLabel}` : yAxisLabel;
  const yAxis = {
      tick: {
        format: fixedPrecision
      },
      label: yAxisLabel
  };

  //Whole-graph formatting options
  c3Data.x = 'x'; //use x series
  const c3Line = {connectNull: false}; //don't connect point data
  const c3Tooltip = {show: false}; //no tooltip or legend, simplify graph.
  const c3Legend = {show: false};

  return {
    data: c3Data,
    line: c3Line,
    tooltip: c3Tooltip,
    legend: c3Legend,
    axis: {
      y: yAxis,
      x: xAxis
    },
  };
}

/*
 * Helper function for makeVariableResponseGraph: given a graph and a
 * variable name, returns the axis label text associated with that variable.
 */
var getAxisTextForVariable = function(graph, variable) {
  let series = graph.data.columns.find(s => {
    return caseInsensitiveStringSearch(s[0], variable);
    });
  
  if(_.isUndefined(series)) {
    throw new Error("Cannot build variable response chart from single variable chart");
  }
  series = series[0];

  //see if this series has an explicit axis association, default to y if not.
  const axis = graph.data.axes[series] ? graph.data.axes[series] : 'y';

  return _.isString(graph.axis[axis].label) ?
      graph.axis[axis].label :
      graph.axis[axis].label.text;
}

module.exports = { timeseriesToAnnualCycleGraph, dataToLongTermAverageGraph,
    timeseriesToTimeseriesGraph, assignColoursByGroup, fadeSeriesByRank,
    hideSeriesInLegend, sortSeriesByRank, makeVariableResponseGraph,
    //exported only for testing purposes:
    formatYAxis, fixedPrecision, makePrecisionBySeries, makeTooltipDisplayNumbersWithUnits,
    getMonthlyData, shortestUniqueTimeseriesNamingFunction,
    getAllTimestamps, nameAPICallParametersFunction, getAxisTextForVariable};
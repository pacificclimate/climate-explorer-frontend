import _ from 'underscore';


var PRECISION = 2;

/* This function takes one or more JSON objects from the 
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
 * and return a C3 graph object displaying them.
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
 * Helper function for parseTimeseriesForC3.
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
 * Helper function for parseTimeseriesForC3. Given a set of timeserieses 
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
  
  var capitalizeWords = function(s) {
    return s.replace(/\b\w/g, c => c.toUpperCase());
  };
  
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
  if(variation.length == 0) {
    throw new Error("Error: cannot graph identical timeseries");
  }
  
  //Remove unique_id from the list of possible variations. All
  //datasets have unique unique_id's; it's not useful on a graph
  variation.splice(variation.indexOf("unique_id"), 1);
  
  //Remove variable_name if variable_id is present; it's redundant
  if(variation.indexOf("variable_name") != -1 && variation.indexOf("variable_id" != -1)) {
    variation.splice(variation.indexOf("variable_name"), 1);
  }
  
  return function (m) {
    name = "";
    for(var j = 0; j < variation.length; j++) {
      name = name.concat(`${m[variation[j]]} `);
    }
    name = name.concat("mean");
    return capitalizeWords(name);
  };
}

/* 
 * Simple formatting function for numbers intended for display.
 */
//TODO: look up significance algorithms and write a smarter one!
var numberFormatFunction = function (n) { return +n.toFixed(PRECISION);};

/*
 * This function returns a number-formatting function for use by the C3
 * tooltip.
 * C3 passes the tooltip formatting function four pieces of information about the 
 * datum being examined: data value, ratio (pie charts only), series id, 
 * and point index within the series.
 *
 * The returned function uses the series id to append a units string to
 * the value.
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


/*
 * Helper function for parseTimeseriesForC3: generates a typical 
 * y-axis configuration, given the text of the label.
 */
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

/* 
 * Helper constant for parseTimseriesForC3: an X-axis configuration 
 * object representing a categorical axis labeled in months.
 */
var monthlyXAxis = {
    type: 'category',
    categories: ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December']
};

module.exports = { timeseriesToAnnualCycleGraph };
/***********************************************************
 * util.js - a collection of data-handling functions 
 ***********************************************************/

var moment = require('moment/moment');
var _ = require('underscore');
import XLSX from 'xlsx';
import * as filesaver from 'filesaver.js';

/*****************************************************************
 * Functions for working with data from the Climate Explorer API
 *****************************************************************/

/*
 * Decimal precision of numbers displayed onscreen (graphs and tables)
 * Used in functions in util.js, chart.js, and export.js.
 */
var PRECISION = 2;

/*
 * Takes a multistats object of the following form and 1) flattens it, and 2)
 * rounds numeric values for passing to the DataTable component for rendering:
 * {
 *  'tasmin_Amon_CanESM2_historical_r1i1p1_19610101-19901231':
 *    { 'median': 278.34326171875,
 *      'min': 225.05545043945312,
 *      'units': 'K',
 *      'mean': 273.56732177734375,
 *      'max': 303.601318359375,
 *      'ncells': 8192,
 *      'stdev': 22.509726901403784,
 *      'run': 'r1i1p1'
 *    },
 * 'tasmin_Amon_CanESM2_historical_r1i1p1_19710101-20001231':
 *   { ... }
 *   };
 */
var parseBootstrapTableData = function (data, metadata) {
  return _.map(data, function (stats, model) {
    var modelMetadata = _.find(metadata, m => m.unique_id == model);
    var period = `${modelMetadata.start_date} - ${modelMetadata.end_date}`;
    var modelInfo = {
      'model_period': period,
      'run': stats.run,
      'min': +stats.min.toFixed(PRECISION),
      'max': +stats.max.toFixed(PRECISION),
      'mean': +stats.mean.toFixed(PRECISION),
      'median': +stats.median.toFixed(PRECISION),
      'stdev': +stats.stdev.toFixed(PRECISION),
      'units': stats.units
    };
    return modelInfo;
  });
};

/*
 * Basic validation of data fetched from a "data" call to the climate
 * explorer backend. Accepts an axios response object, throws an error if
 * anything is missing, otherwise returns the object unaltered.
 */
var validateProjectedChangeData = function(response){
  if(_.isEmpty(response.data) || (typeof response.data == "string")) {
    throw new Error("Error: annual data unavailable for this model.");
  }
  for(var run in response.data) {
    if(!('data' in response.data[run]) || !('units' in response.data[run])) {
      throw new Error("Error: annual data for this model is incomplete.");
    }
  }
  return response;
};

/*
 * Basic validation of data fetched from a "multistats" call to the climate
 * explorer API. Accepts an axios response object, throws an error if
 * any of the expected stats are missing, otherwise, returns the object unaltered.
 */
var validateStatsData = function (response) {
  if(_.isEmpty(response.data) || (typeof response.data == "string")) {
    throw new Error("Error: statistical data unavailable for this model");
  }
  for(var file in response.data) {
    if(_.some('mean stdev min max median ncells'.split(' '),
        attr => !(attr in response.data[file]) || isNaN(response.data[file][attr])) ||
        _.some('units time'.split(' '),
            attr => !(attr in response.data[file]))) {
      throw new Error("Error: statistical data for this model is incomplete");
    }
  }
  return response;
};

/*
 * Basic validation of data fetched from a "timeseries" call to the climate
 * explorer API. Accepts an axios response object, throws an error if
 * any expected data is missing, or if the time resolution isn't monthly, 
 * seasonal, or yearly. Otherwise returns the axios response object unaltered.
 */
var validateAnnualCycleData = function(response) {
  if(_.isEmpty(response.data) || (typeof response.data == "string")) {
    throw new Error("Error: timeseries data is unavailable for this model.");
  }
  if(!_.every('id units data'.split(' '), attr => attr in response.data)) {
    throw new Error("Error: timeseries data for this model is incomplete");
  }
  var resolution = Object.keys(response.data.data).length;
  if([1, 4, 12].indexOf(resolution) == -1) {
    throw new Error("Error: unrecognized time resolution for timeseries");
  }
  return response;
};

/*
 * Get an option defined in the variable-options.yaml config file.
 * This file is used to set formatting options (default map colours,
 * decimal precision, logarithmic scales, etc) at an individual
 * variable level. 
 * variable-options.yaml is guarenteed to exist as a file; webpack 
 * is configured to creates it during pre-startip if it doesn't 
 * already exist, but if webpack creates it, it will be blank.
 * Returns the option value, or "undefined" if the variable or option
 * is not listed. 
 * NOTE: A variable option can legitimately have a value of "false", 
 * so callers of this function need to distinguish between "false" 
 * and "undefined" when acting on its results.
 */
var getVariableOptions = function(variable, option) {
  var vOptions = require('../../variable-options.yaml');
  if(nestedAttributeIsDefined(vOptions, variable, option)){
    return vOptions[variable][option];
  }
  else {
    return undefined;
  }
};

/************************************************************
 * Date and calendar helper functions
 ************************************************************/

//converts a timestep ID(0-16) to a string format
var timeIndexToTimeOfYear = function (timeidx) {
  var timesOfYear = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
    'October', 'November', 'December', 'Winter-DJF', 'Spring-MAM', 'Summer-JJA',
    'Fall-SON', 'Annual'
  ];
  return timesOfYear[timeidx];
};

/*
 * Converts a combination of a timescale (yearly, seasonal, or monthly)
 * and index (0-11) to a string.
 */
var timeResolutionIndexToTimeOfYear = function(res, idx) {
  var timesOfYear = {
      "monthly": [
        'January', 'February', 'March', 'April', 'May', 'June', 
        'July', 'August', 'September','October', 'November', 'December'
        ],
      "seasonal": ["Winter-DJF", "Spring-MAM", "Summer-JJA", "Fall-SON"],
      "yearly": ["Annual"]
  };
  if(res in timesOfYear && idx in timesOfYear[res]) {
    return timesOfYear[res][idx];
  }
  else {
    //fall back to just stringifying the arguments.
    return `${res} ${idx}`;
  }
};

/*
 * extendedDateToBasicDate: converts an ISO8601 extended-formatted date 
 * (like "1997-01-15T00:00:00Z") to an ISO8601 basic-formatted date 
 * (like "1997-01-15")
 */
var extendedDateToBasicDate = function(timestamp) {
  return moment(timestamp, moment.ISO_8601).utc().format('YYYY-MM-DD');
};

/*
 * Infers the time index and time resolution represented by a particular
 * timestamp and returns a human-friendly string. Used by map controllers, 
 * as the WMS API doesn't provide any useful time metadata.
 * Assumes that data for a particular resolution is associated with the median
 * day of that time period: the 15th day of each month for monthly resolutions,
 * July 2 for yearly resolutions, and the 16th day of the central month for 
 * seasonal resolutions. 
 */
var timestampToTimeOfYear = function(timestamp, disambiguateYear = true) {
  var month = moment(timestamp, moment.ISO_8601).utc().format('MMMM');
  var day = moment(timestamp, moment.ISO_8601).utc().format('D');
  var year = disambiguateYear ? moment(timestamp, moment.ISO_8601).utc().format(' YYYY') : "";
  
  if(day == 15) {
    return `${month}${year}`;
  }
  if(day == 16) {
    return `${{"January": "Winter-DJF", "April": "Spring-MAM",
            "July": "Summer-JJA", "October": "Fall-SON"}[month]}${year}`;
  }
  else if ((day == 2 || day == 1) && month == "July") { //some datasets use July 1 for annual data.
    return `Annual${year}`;
  }
  return timestamp;
};

/*
 * Predicate that calculates whether two dates are the same calendar year. 
 * (Not whether they're 365 days apart.)
 */
var sameYear = function(date1, date2) {
  return moment(date1, moment.ISO_8601).utc().format('YYYY') ===
    moment(date2, moment.ISO_8601).utc().format('YYYY');
}

/*****************************************************
 * String-related helper function
 *****************************************************/

/*
 * Returns a string with the first letter of each word capitalized
 * "a 1st string" -> "A 1st String" 
 */
var capitalizeWords = function(s) {
  return s.replace(/\b\w/g, c => c.toUpperCase());
};


/**********************************************************
 * Object-related helper function
 **********************************************************/

/*
 * Given an object and any number of arguments arg1, arg2, arg3,
 * et cetera, returns true if object.arg1.arg2.arg3 is defined
 */
var nestedAttributeIsDefined = function (o, ...attributes) {
  if (_.isUndefined(o)) {
    return false;
  }
  for(var i = 0; i < attributes.length; i++) {
    if(_.isUndefined(o[attributes[i]])) {
      return false
    }
    o = o[attributes[i]];
  }
  return true;
}

module.exports = { PRECISION, parseBootstrapTableData, validateProjectedChangeData, 
    validateStatsData, validateAnnualCycleData, getVariableOptions,
    timeIndexToTimeOfYear, timeResolutionIndexToTimeOfYear, extendedDateToBasicDate, 
    timestampToTimeOfYear, sameYear,
    capitalizeWords,
    nestedAttributeIsDefined};
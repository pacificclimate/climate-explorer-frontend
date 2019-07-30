/* **********************************************************************
 * chart-generators.js - functions that generate a C3 chart specification
 * object from backend query results and metadata describing the query.
 *
 * The three primary functions in this file are:
 * - timeseriesToAnnualCycleGraph, which accepts data from the "timeseries"
 *   API call and generates a structure annual cycle graph with months
 *   labeled along the x-axis.
 *
 * - timeseriesToTimeseriesGraph, which accepts data from the "timeseries"
 *   API call and generates an unstructured timeseries of arbitrary
 *   resolution using whatever dates are available.
 *
 * - dataToLongTermAverageGraph, which accepts data from the "data" API call
 *   and creates timeseries graphs of arbitrary resolution
 *
 * This file also contains helper functions used by the primary functions
 * to generate pieces of the C3 graph-describing data structure, which is
 * specified here: http://c3js.org/reference.html.
 *
 ***************************************************************************/

import _ from 'lodash';
import { PRECISION,
        extendedDateToBasicDate,
        capitalizeWords,
        getVariableOptions,
        nestedAttributeIsDefined,
        caseInsensitiveStringSearch,
        timeResolutionIndexToTimeOfYear,
        timestampToTimeOfYear,
        getDataUnits} from './util';

/* **************************************************
 * 0. Helper functions used by all graph generators *
 ****************************************************/

/*
 * Simple formatting function for numbers to be displayed on the graph.
 * Used as a default when a more specialized formatting function isn't
 * available; ignores all its inputs except the number to be formatted.
 */
function fixedPrecision(n) { return +n.toFixed(PRECISION);}

// Generates a typical y-axis configuration, given the text of the label.
function formatYAxis(label) {
  return {
    label: {
      text: label,
      position: 'outer-middle',
    },
    tick: {
      format: fixedPrecision,
    },
    show: true,
  };
}

/*
 * Accepts a object with seriesname:variable pairs.
 * Returns a function that accepts a number and a series name, and formats
 * the number according to precision set in the variable-options.yaml config
 * file for the associated variable, or a default precision with
 * util.PRECISION for variables with no precision options in the file.
 */
function makePrecisionBySeries(series) {
  let dictionary = {};
  for (let s in series) {
    const fromConfig = getVariableOptions(series[s], 'decimalPrecision');
    dictionary[s] = _.isUndefined(fromConfig) ? PRECISION : fromConfig;
  }

  return function (n, name) {return +n.toFixed(dictionary[name]);};
}

/*
 * This formatting function is used in chart tooltips to label the
 * names of data points. It searches the name of the displayed time
 * series for the keywords "Seasonal" or "Monthly". If it finds them,
 * it replaces the keyword with the name of the individual month or
 * season this data point represents ("June", "Winter", etc)
 *
 * If it finds neither keyword, it returns the name of the series
 * unchanged.
 *
 * C3 passes tooltip text formatting functions four arguments:
 *   - the name of the data series (index)
 *   - ratio of this data point to total - pie charts only (ratio)
 *   - nominal value of this data point (value)
 *   - n where this data point is the nth in its series (index)
 * This function only uses the name and index arguments.
 */
function tooltipAddTimeOfYear(name, ratio, value, index) {
  if(caseInsensitiveStringSearch(name, "monthly")) {
    return name.replace(/monthly/gi,
        timeResolutionIndexToTimeOfYear("monthly", index));
  } else if(caseInsensitiveStringSearch(name, "seasonal")) {
    // timestamp representing this month - only the month is relevant
    const timestamp = new Date(0, index);
    return name.replace(/seasonal/gi,
        timestampToTimeOfYear(timestamp.toISOString(), "seasonal", false)); 
  } else {
    return name;
  }
}

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
function makeTooltipDisplayNumbersWithUnits(axes, axis, precisionFunction) {
  let unitsDictionary = {};
  const pf = _.isUndefined(precisionFunction) ? fixedPrecision : precisionFunction;

  // build a dictionary between timeseries names and units
  for (let series in axes) {
    if (axis[axes[series]].units) { // use explicit units if present
      unitsDictionary[series] = axis[axes[series]].units;
    } else { // fall back to axis text label
      unitsDictionary[series] = axis[axes[series]].label.text;
    }
  }

  return function (value, ratio, id) {
    return `${pf(value, id)} ${unitsDictionary[id]}`;
  };
}

/*
 * Helper function for assignDataToYAxis.
 *
 * Accepts a c3 chart spec and the name of a y axis (typically "y" or "y2").
 *
 * It determines whether the y axis is already defined in the chart spec.
 *
 * If the axis is defined, it checks for the following parameters
 * of the axis:
 *   - units
 *   - groupBy.type
 *   - groupBy.value
 * These attributes are not part of the standard c3 graph spec; they are added
 * by assignDataToYAxis during chart creation to facilitate adding additional
 * datasets to a pre-existing graph.
 *
 * If the y axis is completely unspecified, returns an object containing empty
 * strings for each sorting parameter. A new unformatted graph, ready for data
 * assignment.
 *
 * If the y axis is defined but does not specify all the sorting attributes,
 * throws an error. It isn't possible to add more data to this graph; not
 * enough information.
 *
 * If the axis is defined and specifies all the sorting parameters, return an object
 * containing them, which assignDataToYAxis will use to assign new data to
 * the graph following the pattern laid out by data already present.
 */
function axisSortingParams(graph, yAxis) {
  let params = {
    units: '',
    groupBy: { type: '', value: '' },
  };
  if (graph.axis) {
    const axis = graph.axis[yAxis];
    if (axis) {
      if (nestedAttributeIsDefined(axis, 'units')
         && nestedAttributeIsDefined(axis, 'groupBy', 'type')
         && nestedAttributeIsDefined(axis, 'groupBy', 'value')) {
        params.units = axis.units;
        params.groupBy.type = axis.groupBy.type;
        params.groupBy.value = axis.groupBy.value;
      } else {
        throw new Error('Error: unable to add data to y axis ' + yAxis);
      }
    }
  }
  return params;
}

/*
 * This helper function accepts a graph spec object already populated
 * with data series and a metadata object containing variable and
 * unit attributes about each data series, like this:
 *
 * {
 *   "Monthly Tasmax": {
 *     variable: "tasmax",
 *     units: "degC",
 *   },
 *   "Annual Tasmin": {
 *     variable: "tasmin",
 *     units: "degC",
 *   },
 * }
 *
 * If no y-axis is defined, it will create and format up to two as
 * needed (c3 supports >2, but we limit to 2 for readability). If one
 * or more axes is defined, it will assign data to pre-existing axes.
 * It returns the resulting graph spec object.
 *
 * Series can be assigned to axes based on either unit or variable.
 * The default is grouping by variable; calling it with groupByUnits =
 * true will group by units instead. For example, tasmax and tasmin
 * will be graphed with the same y axis if grouped by units (degC) but
 * graphed on separate axes if grouped by variable (tasmin vs tasmax).
 *
 * In addition to standard c3 axis formatting, this function creates
 * and uses the custom "groupBy" and "units" attributes of axis.y and
 * axis.y2. These support adding additional data series to
 * previously-created y-axes.
 *
 * axis.[y|y2].units is a string giving the units.
 * axis.[y|y2].groupBy looks like this:
 * {
 *   type: "variable" | "units",
 *   value: "degC" | "tasmin" | "tasmax" | "days" | etc.
 * }
 *
 * It returns a graph object with formatted axes.
 */
function assignDataToYAxis(graph, seriesMetadata, groupByUnits = false) {
  // get sorting algorithm, if the chart already has one.
  const sortingParams = {
    y: axisSortingParams(graph, 'y'),
    y2: axisSortingParams(graph, 'y2'),
  };

  if (sortingParams.y.groupBy.type !== sortingParams.y2.groupBy.type) {
    // make sure both axes agree on the data sorting.
    throw new Error('Error: axis data grouping inconsistent.');
  }

  let groupBy = 'variable'; // default and most common case.

  if (groupByUnits) {
    // check to make sure the caller of this function didn't request grouping
    // by units when the existing graph is already grouped by variable.
    if (sortingParams.y.groupBy.type === 'variable') {
      throw new Error('Error: cannot regroup data series');
    }
    groupBy = 'units';
  } else if (sortingParams.y.groupBy.type === 'units') {
    // caller didn't specify a grouping algorithm, but
    // this graph is already grouped by units, use that.
    groupBy = 'units';
  }

  // collect all data series name, but exclude the data series named "x" - it is
  // a C3 convention used to format labels for the x axis (months & seasons,
  // in our case), not a real data series.
  const seriesNames = graph.data.columns.map(col => col[0]).filter(n => n !== 'x');

  const allotSeriesToAxis = (axis, seriesName) => {
    // attempts to sort a data series to the named y axis
    // it checks to see if metadata about the series matches the
    // sorting parameters set for this axis.
    // if no sorting parameters for this axis are set yet, they
    // will be initialized to match this data series.
    // it returns false if the data series cannot be assigned to the axis.
    const seriesMeta = seriesMetadata[seriesName];
    if (!sortingParams[axis].groupBy.value) {
      // this axis has not been initialized. initialize it before assigning.
      sortingParams[axis].groupBy.type = groupBy;
      sortingParams[axis].groupBy.value = seriesMeta[groupBy];
      sortingParams[axis].units = seriesMeta.units;
    }
    // check to see if this data series matches this axis' parameters
    if (seriesMeta[groupBy] === sortingParams[axis].groupBy.value) {
      // it does!
      if (seriesMeta.units !== sortingParams[axis].units) {
        // ... but the units are wrong. Error.
        throw new Error('Error: mismatched units for graph axis ' + axis);
      }
      // a valid assignment.
      graph.data.axes[seriesName] = axis;
      return true;
    }
    // not a match
    return false;
  };

  for (const seriesName of seriesNames) {
    if (!(allotSeriesToAxis('y', seriesName) || allotSeriesToAxis('y2', seriesName))) {
      // this data series is a match for neither Y axis.
      throw new Error('Error: too many data axes required for graph');
    }
  }

  // all data series have been assigned. Format each axis to display accordingly.
  graph.axis = graph.axis ? graph.axis : {};

  const formatSortedAxis = (yAxis) => {
    if (sortingParams[yAxis].groupBy.value && !graph.axis[yAxis]) {
      // data was assigned to this axis, and the axis is not formatted already
      const params = sortingParams[yAxis];
      let label = '';
      if (groupBy === 'variable'
        && params.groupBy.value !== missingVariableName) {
        label = `${params.groupBy.value} ${params.units}`;
      } else {
        label = params.units;
      }

      // add the parameters used in sorting the data to the axis spec -
      // so more data can be added later in a subsequent call to assignDataToYAxis
      graph.axis[yAxis] = formatYAxis(label);
      graph.axis[yAxis].units = params.units;
      graph.axis[yAxis].groupBy = params.groupBy;
    }
  };

  formatSortedAxis('y');
  formatSortedAxis('y2');
  return graph;
}


/* ************************************************************
 * 1. timeseriesToAnnualCycleGraph() and its helper functions *
 **************************************************************/

/*
 * Helper constant for timeseriesToAnnualCycleGraph: an X-axis configuration
 * object representing a categorical axis labeled in months.
 */
const monthlyXAxis = {
  type: 'category',
  categories: ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'],
};

/*
 * Helper function for timeseriesToAnnualCycleGraph.
 * Accepts a dataseries object with 1, 4, or 12 timestamp:value pairs
 * and returns an array with twelve values in order by timestamp,
 * repeating values as necessary to get a monthly-resolution sequence.
 */
function getMonthlyData(data, timescale = 'monthly') {
  const expectedTimestamps = { monthly: 12, seasonal: 4, yearly: 1 };
  let monthlyData = [];
  const timestamps = Object.keys(data).sort();

  if (timestamps.length === 17) {
    throw new Error('Error: concatenated 17-point chronology.');
  }

  if (timestamps.length !== expectedTimestamps[timescale]) {
    throw new Error('Error: inconsistent time resolution in data');
  }

  for (let i = 0; i < 12; i++) {
    let mapped = Math.ceil((timestamps.length / 12.0) * (i + 1)) - 1;
    monthlyData.push(data[timestamps[mapped]]);
  }

  // Seasonal timeseries need one month of winter removed from the beginning of the
  // year and added at the end, since winter wraps around the calendar new year.
  if (timescale === 'seasonal') {
    monthlyData = monthlyData.slice(1, 12);
    monthlyData.push(data[timestamps[0]]);
  }

  return monthlyData;
}

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
 * timeseries and leave out any metadata that doesn't. They end with a
 * basename specific to the variable and set in the variable config file 
 * (or "mean" if the config file doesn't specify).
 */
// TODO: special case climatological period to display as (XXXX-XXXX)
// TODO: possibly cue descriptors to appear in a specific order?
// "Tasmin Monthly Mean" sounds better than "Monthly Tasmin Mean".
function shortestUniqueTimeseriesNamingFunction(metadata, data) {
  if (metadata.length === 0) {
    throw new Error('No data to show');
  }

  // only one timeseries being graphed, simple label.
  if (data.length === 1) {
    return function (m) { return capitalizeWords(`${m.timescale} mean`);};
  }

  let variation = [];
  const exemplarMetadata = _.find(metadata, function (m) {return m.unique_id === data[0].id;});

  for (let datum of data) {
    const comparandMetadata = _.find(metadata, function (m) {return m.unique_id === datum.id;});

    for (let att in comparandMetadata) {
      if (exemplarMetadata[att] !== comparandMetadata[att] && variation.indexOf(att) === -1) {
        variation.push(att);
      }
    }
  }

  // Remove unique_id from the list of possible variations. All
  // datasets have unique unique_id's; it's not useful on a graph
  variation.splice(variation.indexOf('unique_id'), 1);

  // Remove variable_name if variable_id is present, since we don't need both
  if (variation.indexOf('variable_name') !== -1 && variation.indexOf('variable_id' !== -1)) {
    variation.splice(variation.indexOf('variable_name'), 1);
  }

  if (variation.length === 0) {
    throw new Error('Error: cannot graph identical timeseries');
  }
  
  // Build a dictionary with the base name for each variable (typically
  // either "Mean" or "Mean Count") from the variable config file. 
  // Defaults to "Mean" since all data displayed by this graph is MYMs.
  const variables = _.uniq(_.map(metadata, 'variable_id'));
  function getVarBasename(v) {
    const fromConfig = getVariableOptions(v, 'seriesLegendString');
    return _.isUndefined(fromConfig) ? "Mean" : fromConfig;
  }
  const basenameByVariable = _.zipObject(variables, _.map(variables, getVarBasename));

  return function (m) {
    let name = '';
    for (let v of variation) {
      name = name.concat(`${m[v]} `);
    }
    name = name.concat(basenameByVariable[m.variable_id]);
    return capitalizeWords(name);
  };
}

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
function timeseriesToAnnualCycleGraph(metadata, ...data) {
  // blank graph data object to be populated - holds data values
  // and individual-timeseries-level display options.
  let c3Data = {
    columns: [],
    types: {},
    labels: {},
    axes: {},
  };

  let seriesMetadata = {};
  let seriesVariables = {};

  const getTimeseriesName = shortestUniqueTimeseriesNamingFunction(metadata, data);

  // Add each timeseries to the graph
  for (let timeseries of data) {
    // get metadata for this timeseries
    const timeseriesMetadata = _.find(metadata, function (m) {
      return m.unique_id === timeseries.id;
    });
    const timeseriesName = getTimeseriesName(timeseriesMetadata);

    // add the actual data to the graph
    c3Data.columns.push([timeseriesName].concat(
        getMonthlyData(timeseries.data, timeseriesMetadata.timescale)));

    // monthly data is displayed as a line graph, but yearly and seasonal
    // display as step graphs.
    c3Data.types[timeseriesName] = timeseriesMetadata.timescale === 'monthly' ? 'line' : 'step';

    seriesMetadata[timeseriesName] = {
      units: getDataUnits(timeseries, timeseriesMetadata.variable_id),
      variable: timeseriesMetadata.variable_id,
    };
    seriesVariables[timeseriesName] = timeseriesMetadata.variable_id;
  }

  // whole-graph display options: axis formatting and tooltip behaviour
  let c3Axis = {};
  c3Axis.x = monthlyXAxis; // format x axis
  let graph = {
    data: c3Data,
    axis: c3Axis,
  };
  graph = assignDataToYAxis(graph, seriesMetadata); // format y axes

  // create tooltip
  const precision = makePrecisionBySeries(seriesVariables);
  let c3Tooltip = { format: {} };
  c3Tooltip.grouped = 'true';
  c3Tooltip.format.value = makeTooltipDisplayNumbersWithUnits(graph.data.axes,
      graph.axis, precision);
  c3Tooltip.format.name = tooltipAddTimeOfYear;

  graph.tooltip = c3Tooltip;
  return graph;
}

/* **********************************************************
 * 2. dataToLongTermAverageGraph() and its helper functions *
 ************************************************************/

/*
 * Helper constant for dataToLongTermAverageGraph: replaces
 * missing variable name in some formatting functions shared
 * by multiple graph types that require a variable name.
 * Not shown to the user.
 * The 'data' API call, when called for a single run, returns no
 * variable name.
 */
const missingVariableName = 'defaultVariable';


/*
 * Helper constant for dataToLongTermAverageGraph: Format object
 * for a timeseries X axis.
 */
const timeseriesXAxis = {
  type: 'timeseries',
  tick: {
    format: '%Y-%m-%d',
  },
};

/*
 * Helper function for dataToLongTermAverageGraph. Extracts the
 * list of all unique timestamps found in the data.
 */
function getAllTimestamps(data) {
  let allTimes = [];

  const addSeries = function (seriesData) {
    for (let timestamp in seriesData) {
      if (!_.find(allTimes, function (t) {return t === timestamp;})) {
        allTimes.push(timestamp);
      }
    }
  };

  for (let i in _.keys(data)) {
    if (!_.isUndefined(data[i].data)) { // data is from "timeseries" API
      addSeries(data[i].data);
    } else { // data is from "data" API
      for (let run in data[i]) {
        addSeries(data[i][run].data);
      }
    }
  }
  if (allTimes.length === 0) {
    throw new Error('Error: no time stamps in data');
  }
  return allTimes;
}

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
function nameAPICallParametersFunction(contexts) {
  let variation = [];
  const exemplarContext = contexts[0];

  for (let context of contexts) {
    for (let att in context) {
      if (exemplarContext[att] !== context[att] && variation.indexOf(att) === -1) {
        variation.push(att);
      }
    }
  }

  // "data" API was called more than once with the same arguments -
  // probably a mistake.
  if (variation.length === 0) {
    throw new Error('Error: cannot graph two identical queries');
  }

  // an "area" is just a list of points. The naive algorithm used to generate
  // data series names here would just display the entire list next to each
  // data series in the graph legend, which would be unhelpful, and an invalid
  // series name as far as C3 is concerned. At present, throw an error
  // if attempting to graph data series associated with different areas. If
  // this functionality is needed in the future, it can be implemented here.
  if (variation.indexOf('area') !== -1) {
    throw new Error('Error: cannot display two datasets associated with different areas.');
  }

  return function (run, context) {
    let name = '';
    for (let v of variation) {
      name = name.concat(`${context[v]} `);
    }
    name = name.concat(run);
    return name;
  };
}

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
function dataToLongTermAverageGraph(data, contexts = []) {
  // blank graph data object to be populated - holds data values
  // and individual-timeseries-level display options.
  let c3Data = {
    columns: [],
    types: {},
    labels: {},
    axes: {},
  };

  let seriesVariables = {};
  let seriesMetadata = {};
  let nameSeries;

  if (data.length === 1) {
    nameSeries = function (run) {return run;};
  } else if (data.length === contexts.length) {
    nameSeries = nameAPICallParametersFunction(contexts);
  } else {
    throw new Error('Error: no context provided for timeseries data');
  }

  // get the list of all timestamps and add them to the chart
  // (C3 requires x-axis timestamps be added as a data column)
  const timestamps = getAllTimestamps(data);
  c3Data.columns.push(['x'].concat(_.map(timestamps, extendedDateToBasicDate)));
  c3Data.x = 'x';

  // add each API call to the chart
  for (let i = 0; i < data.length; i++) {
    const context = contexts.length ? contexts[i] : {};
    const call = data[i];

    // add each individual dataset from the API to the chart
    for (let run in call) {
      const runName = nameSeries(run, context);
      const seriesVariable = _.isEmpty(context) ? missingVariableName : context.variable_id;
      seriesVariables[runName] = seriesVariable;
      seriesMetadata[runName] = {
        variable: seriesVariable || '', // single-run has no var metadata
        units: getDataUnits(call[run], seriesVariable),
      };
      const series = [runName];

      // if a given timestamp is present in some, but not all
      // datasets, set the timestamp's value to "null"
      // in the C3 data object. This will cause C3 to render the
      // line with a break where the missing timestamp is.
      for (let t of timestamps) {
        series.push(_.isUndefined(call[run].data[t]) ? null : call[run].data[t]);
      }
      c3Data.columns.push(series);
      c3Data.types[runName] = 'line';
    }
  }

  // whole-graph display options: axis formatting and tooltip behaviour
  let c3Axis = {};
  c3Axis.x = timeseriesXAxis;

  // The long term average graph doesn't require every series to have the exact
  // same timestamps, since it's comparing long term trends anyway. Allow C3
  // to smoothly connect series even if they're "missing" timestamps.
  const c3Line = {
    connectNull: true,
  };

  let graph = {
    data: c3Data,
    axis: c3Axis,
    line: c3Line,
  };

  graph = assignDataToYAxis(graph, seriesMetadata);

  // Note: if context is empty (dataToLongTermAverageGraph was called with only
  // one time series), variable-determined precision will not be available and
  // numbers will be formatted with default precision.
  const precision = makePrecisionBySeries(seriesVariables);
  graph.tooltip = { format: {} };
  graph.tooltip.grouped = 'true';
  graph.tooltip.format.value = makeTooltipDisplayNumbersWithUnits(graph.data.axes,
      graph.axis, precision);

  return graph;
}

/* ************************************************************
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
function timeseriesToTimeseriesGraph(metadata, ...data) {
  // blank graph data object to be populated - holds data values
  // and individual-timeseries-level display options.
  let c3Data = {
    columns: [],
    types: {},
    labels: {},
    axes: {},
  };
  let seriesVariables = {};
  let seriesMetadata = {};

  const getTimeseriesName = shortestUniqueTimeseriesNamingFunction(metadata, data);

  // get list of all timestamps
  const timestamps = getAllTimestamps(data);
  c3Data.columns.push(['x'].concat(_.map(timestamps, extendedDateToBasicDate)));
  c3Data.x = 'x';

  // Add each timeseries to the graph
  for (let timeseries of data) {
    // get metadata for this timeseries
    const timeseriesMetadata = _.find(metadata,
        function (m) {return m.unique_id === timeseries.id;});
    const timeseriesName = getTimeseriesName(timeseriesMetadata);
    const seriesVariable = timeseriesMetadata.variable_id;
    seriesVariables[timeseriesName] = seriesVariable;
    seriesMetadata[timeseriesName] = {
      units: getDataUnits(timeseries, seriesVariable),
      variable: seriesVariable,
    };

    // add the actual data to the graph
    let column = [timeseriesName];

    for (let t of timestamps) {
      // assigns "null" for any timestamps missing from this series.
      // C3's behaviour toward null values is set by the line.connectNull attribute
      column.push(_.isUndefined(timeseries.data[t]) ? null : timeseries.data[t]);
    }

    c3Data.columns.push(column);
    c3Data.types[timeseriesName] = 'line';
  }

  // whole-graph display options: axis formatting and tooltip behaviour
  let c3Axis = {};
  c3Axis.x = timeseriesXAxis;
  const c3Subchart = { show: true,
      size: { height: 20 } };

  // instructs c3 to connect series across gaps where a timeseries is missing
  // a timestamp. While this could be confusing in cases where a datapoint
  // is actually missing from a series, it's helpful in cases where
  // series are at different time resolutions (monthly/yearly), so it's
  // included by default.
  const c3Line = {
    connectNull: true,
  };

  let graph = {
    data: c3Data,
    subchart: c3Subchart,
    axis: c3Axis,
    line: c3Line,
  };
  graph = assignDataToYAxis(graph, seriesMetadata);

  const precision = makePrecisionBySeries(seriesVariables);
  graph.tooltip = { format: {} };
  graph.tooltip.grouped = 'true';
  graph.tooltip.format.value = makeTooltipDisplayNumbersWithUnits(graph.data.axes,
      graph.axis, precision);

  return graph;
}

export { timeseriesToAnnualCycleGraph, dataToLongTermAverageGraph,
    timeseriesToTimeseriesGraph,
    // exported only for testing purposes:
    formatYAxis, fixedPrecision, makePrecisionBySeries,
    makeTooltipDisplayNumbersWithUnits, tooltipAddTimeOfYear,
    getMonthlyData, shortestUniqueTimeseriesNamingFunction,
    getAllTimestamps, nameAPICallParametersFunction };

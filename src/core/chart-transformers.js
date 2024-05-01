/************************************************************************
 * chart-transformers.js - functions that accept a C3 chart specification
 *   for a timeseries chart and alter the data to produce a different
 *   type of chart.
 *
 * These functions accepts a C3 graph specification object and supplemental
 * parameters that vary by function. They return a C3 graph spec.
 *
 * The main functions in this file are:
 *
 *  - makeVariableReponseGraph: transforms a graph with one or more pairs
 *    of timeseries representing different variables into a graph showing
 *    correlation between the variables (x and y axes are the variables)
 *
 *  - makeAnomalyGraph: using one of the existing data series as the base,
 *    adds additional data series representing the difference between the
 *    base series and each other data series
 *
 *  - makeTimeSliceGraph: accepts a graph showing one or more timeseries
 *    and a timestamp, returns a simplified narrow vertical graph showing
 *    only that timestamp. Intended for use as a sidebar.
 ***************************************************************************/
import _ from "lodash";
import { caseInsensitiveStringSearch, getVariableOptions } from "./util";
import { fixedPrecision } from "./chart-generators";
import {
  assignColoursByGroup,
  hideSeriesInTooltip,
  hideSeriesInLegend,
  padYAxis,
  fadeSeriesByRank,
  hideTicksByRange,
} from "./chart-formatters";

/***************************************************************************
 * 0. makeVariableReponseGraph and its helper functions
 ***************************************************************************/

/*
 * Graph transformation function that accepts two keywords (x and y) and a graph
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
function makeVariableResponseGraph(x, y, graph) {
  let c3Data = {};

  const seriesNameContains = function (series, keyword) {
    return caseInsensitiveStringSearch(series[0], keyword);
  };

  const xseries = _.filter(graph.data.columns, (series) =>
    seriesNameContains(series, x),
  );
  const yseries = _.filter(graph.data.columns, (series) =>
    seriesNameContains(series, y),
  );

  let tuples = [];
  let seriesMatched = false;
  for (const independent of xseries) {
    //Try to match each dependent variable series with an independent variable series
    let dependent = _.find(yseries, (series) => {
      return (
        series[0].toLowerCase().replace(y.toLowerCase(), x.toLowerCase()) ===
        independent[0].toLowerCase()
      );
    });
    if (dependent) {
      seriesMatched = true;
      for (let n = 1; n < independent.length; n++) {
        if (!_.isNull(independent[n]) && !_.isNull(dependent[n])) {
          tuples.push([independent[n], dependent[n]]);
        }
      }
    }
  }
  if (!seriesMatched) {
    throw new Error("Unable to correlate variables");
  }

  //sort by x value, preperatory to putting on the graph.
  tuples.sort((a, b) => a[0] - b[0]);

  //C3 doesn't really support scatterplots, but we can fake it by adding
  //a missing data point between each actual data point, and instructing C3
  //not to connect across missing data points with {connectNull: false}
  //TODO: break this out into makeScatterplot(); we'll likely need it again
  c3Data.columns = [];
  c3Data.columns.push(
    _.reduce(
      tuples,
      (memo, tuple, index, list) => {
        memo.push(tuple[0]);
        if (index < list.length - 1) {
          memo.push(tuple[0] / 2 + list[index + 1][0] / 2);
        }
        return memo;
      },
      ["x"],
    ),
  );
  c3Data.columns.push(
    _.reduce(
      tuples,
      (memo, tuple, index, list) => {
        index < list.length - 1
          ? memo.push(tuple[1], null)
          : memo.push(tuple[1]);
        return memo;
      },
      [y],
    ),
  );

  // Generate x and y axes. Reuse labels from source graph,
  // but add variable names if not present.
  let xAxisLabel = getAxisTextForVariable(graph, x);
  xAxisLabel = xAxisLabel.search(x) === -1 ? `${x} ${xAxisLabel}` : xAxisLabel;
  const xAxis = {
    tick: {
      count: 8,
      fit: true,
      format: fixedPrecision,
    },
    label: xAxisLabel,
  };

  let yAxisLabel = getAxisTextForVariable(graph, y);
  yAxisLabel = yAxisLabel.search(y) === -1 ? `${y} ${yAxisLabel}` : yAxisLabel;
  const yAxis = {
    tick: {
      format: fixedPrecision,
    },
    label: yAxisLabel,
  };

  //Whole-graph formatting options
  c3Data.x = "x"; //use x series
  const c3Line = { connectNull: false }; //don't connect point data
  const c3Tooltip = { show: false }; //no tooltip or legend, simplify graph.
  const c3Legend = { show: false };

  return {
    data: c3Data,
    line: c3Line,
    tooltip: c3Tooltip,
    legend: c3Legend,
    axis: {
      y: yAxis,
      x: xAxis,
    },
  };
}

/*
 * Helper function for makeVariableResponseGraph: given a graph and a
 * variable name, returns the axis label text associated with that variable.
 */
function getAxisTextForVariable(graph, variable) {
  let series = graph.data.columns.find((s) => {
    return caseInsensitiveStringSearch(s[0], variable);
  });

  if (_.isUndefined(series)) {
    throw new Error(
      "Cannot build variable response chart from single variable chart",
    );
  }
  series = series[0];

  //see if this series has an explicit axis association, default to y if not.
  const axis = graph.data.axes[series] ? graph.data.axes[series] : "y";

  return _.isString(graph.axis[axis].label)
    ? graph.axis[axis].label
    : graph.axis[axis].label.text;
}

/***************************************************************************
 * 1. makeAnomalyGraph and its helper functions
 ***************************************************************************/
/*
 * Graph transformation function that accepts a graph containing one or more
 * timeseries associated with a single axis, the name of the displayed variable,
 * and the name of one of the timeseries to use as a base.
 *
 * Adds a secondary y axis, graphing a data series showing the difference
 * (anomaly) between each of the original series and the base series.
 *
 * The anomaly series will have the same hue, but somewhat desaturated colour
 * as the original series they represent.They will not appear in legends or
 * tooltips, but their name (if needed for further graph manipulation)
 * will be "[original name] Anomaly."
 *
 * This is intended to display change over time on a single graph.
 *
 * The variable argument should be left undefined if multiple
 * variables are shown on the graph.
 */

function makeAnomalyGraph(base, variable_id, graph) {
  //anomalies for some variables are typically expressed as percentages.
  //if this is a single variable graph, check the variable configuration
  //to see if this is one of them; if so, display percentages on the chart.
  const displayPercent =
    !_.isUndefined(variable_id) &&
    getVariableOptions(variable_id, "percentageAnomalies");

  if (!_.isUndefined(graph.axis.y2)) {
    throw new Error(
      "Error: Cannot calculate anomalies for multiple data types.",
    );
  }

  const baseSeries = _.find(graph.data.columns, (series) => {
    return series[0] === base;
  });
  if (_.isUndefined(baseSeries)) {
    throw new Error("Error: Invalid base data for anomaly calculation.");
  }
  const baseSeriesName = baseSeries[0];

  const origLength = graph.data.columns.length;
  graph.data.axes = {};
  graph.axis.y2 = { show: true };

  for (let i = 0; i < origLength; i++) {
    let seriesName = graph.data.columns[i][0];
    if (seriesName !== "x" && seriesName !== base) {
      let oldSeries = graph.data.columns[i];
      if (oldSeries.length !== baseSeries.length) {
        throw new Error(
          "Error: Incorrect data series length, cannot calculate anomaly",
        );
      }

      let newSeries = [];
      newSeries.push(`${seriesName} Anomaly`);
      for (let j = 1; j < oldSeries.length; j++) {
        newSeries.push(
          displayPercent
            ? percentageChange(baseSeries[j], oldSeries[j])
            : oldSeries[j] - baseSeries[j],
        );
      }
      graph.data.columns.push(newSeries);
      graph.data.axes[seriesName] = "y";
      graph.data.axes[`${seriesName} Anomaly`] = "y2";
      graph.data.types[`${seriesName} Anomaly`] =
        oldSeries[0] === base ? "line" : "bar";
    }
  }
  graph.axis.y2.label = {};
  graph.axis.y2.label.position = "outer-middle";

  let oldAxisText = getAxisTextForVariable(graph, baseSeriesName);
  oldAxisText = oldAxisText.replace(variable_id, ""); // avoid repetition with base series name
  graph.axis.y2.label.text = displayPercent
    ? `% change from ${baseSeriesName}`
    : `change in ${oldAxisText} from ${baseSeriesName}`;
  graph.axis.y2.tick = {};
  graph.axis.y2.tick.format = graph.axis.y.tick.format;

  // function that determines whether a data series an anomaly series.
  // used to format anomalies differently than data
  function isAnomaly(series) {
    return caseInsensitiveStringSearch(series[0], "Anomaly");
  }

  // classifier function that matches each "anomaly" data series with
  // the nominal series it is based on. Used to match colours.
  function anomalyMatcher(series) {
    const sName = series[0];
    return isAnomaly(series) ? sName.substring(0, sName.length - 8) : sName;
  }

  // ranking function that assigns anomaly series lower results than
  // nominal series, used to make them distinguishable.
  function anomalyRanker(series) {
    return isAnomaly(series) ? 0.7 : 1;
  }

  //assign anomaly data series the same colour as the series they describe.
  graph = assignColoursByGroup(graph, anomalyMatcher);

  //remove anomaly series from tooltips and legends, lighten anomalies
  graph = hideSeriesInTooltip(graph, isAnomaly);
  graph = hideSeriesInLegend(graph, isAnomaly);
  graph = fadeSeriesByRank(graph, anomalyRanker);

  //show anomalies with nominal values in tooltip:
  graph.tooltip.format.value = addAnomalyTooltipFormatter(
    graph.tooltip.format.value,
    baseSeries,
    displayPercent,
  );

  //move the two sets of data apart for less confusing visuals
  graph = padYAxis(graph, "y2", "top", 1.1);
  graph = padYAxis(graph, "y", "bottom", 1.1);

  graph = hideTicksByRange(graph, "y");
  graph = hideTicksByRange(graph, "y2");

  return graph;
}

/*
 * Helper function for makeAnomalyGraph: returns the percent difference
 * of two values.
 */
function percentageChange(a, b) {
  if (a === 0) {
    //this shouldn't happen, as percentage changes are only used for
    //whitelisted variables like precip, which should always have a > 0.
    //but if it does (bad data), return null, which will make the graph
    //skip this data point.
    return null;
  }
  return (100 * (b - a)) / Math.abs(a);
}

/*
 * Helper function for makeAnomalyGraph: takes an existing tool tip number
 * formatting function, and adds a wrapper which appends the anomaly from
 * the specified base series, either as a percent or nominal value.
 */
function addAnomalyTooltipFormatter(oldFormatter, baseSeries, displayPercent) {
  const newTooltipValueFormatter = function (value, ratio, id, index) {
    let nominal = oldFormatter(value, ratio, id, index);
    if (_.isUndefined(nominal)) {
      //this series doesn't display in tooltip.
      return undefined;
    } else {
      const anomaly = displayPercent
        ? percentageChange(baseSeries[index + 1], value)
        : value - baseSeries[index + 1];
      const sign = anomaly >= 0 ? "+" : "";
      const percent = displayPercent ? "%" : "";
      const anomPrint = _.isNull(anomaly) ? "-" : anomaly.toPrecision(2);
      return nominal + " (" + sign + anomPrint + percent + ")";
    }
  };
  return newTooltipValueFormatter;
}

/***************************************************************************
 * 1. makeTimeSliceGraph and its helper functions
 ***************************************************************************/
/*
 * Given a timeseries graph and a string matching a timestamp in that graph,
 * returns a new graph containing only data present at that particular moment.
 *
 * Can generate a timeslice from a C3 graph specification with an x-axis of
 * either "timeseries" (like a Long Term Average graph) or "category" (like an
 * Annual Cycle graph) type, but not from a graph with an "indexed" type x axis.
 */

function makeTimeSliceGraph(timestamp, graph) {
  let slicedData = [];
  let timestamps = [];
  let sliceIndex = -1;

  if (graph.axis.x.type === "timeseries") {
    //x-axis has a series of dates
    timestamps = graph.data.columns.find(function (series) {
      return series[0] === "x";
    });
  } else if (graph.axis.x.type === "category") {
    //x-axis is text, most likely month names
    timestamps = graph.axis.x.categories;
  } else {
    throw new Error(
      "Error: timeslice graph must be generated from a timeseries",
    );
  }

  if (_.isUndefined(timestamps)) {
    throw new Error("Error: time information missing from source graph");
  }

  sliceIndex = timestamps.indexOf(timestamp);
  if (sliceIndex === -1) {
    throw new Error("Error: invalid timestamp selected");
  }

  for (let i = 0; i < graph.data.columns.length; i++) {
    let series = graph.data.columns[i];
    if (!_.isUndefined(series[sliceIndex]) && series[0] !== "x") {
      slicedData.push([series[0], series[sliceIndex]]);
    }
  }

  //sort the data series by value, to make matching with the legend easier
  slicedData.sort((a, b) => {
    return b[1] - a[1];
  });

  graph.data.columns = slicedData;

  //remove timeseries-related formatting
  let date = new Date(timestamp);
  graph.axis.x = {
    type: "category",
    categories: [date.getFullYear()],
  };
  graph.data.x = undefined;
  graph.tooltip = { show: false };

  return graph;
}

export {
  makeVariableResponseGraph,
  makeAnomalyGraph,
  makeTimeSliceGraph,
  //exported only for testing purposes:
  getAxisTextForVariable,
  percentageChange,
};

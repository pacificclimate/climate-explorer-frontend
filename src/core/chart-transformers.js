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
 *    base series and each other data series (including itself)
 ***************************************************************************/
import _ from 'underscore';
import {caseInsensitiveStringSearch} from './util';
import {fixedPrecision} from './chart-generators';
import {assignColoursByGroup, hideSeriesInTooltip,
        hideSeriesInLegend, padYAxis,
        fadeSeriesByRank} from './chart-formatters';

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
function makeVariableResponseGraph (x, y, graph) {
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
    //TODO: breake this out into makeScatterplot(); we'll likely need it again
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
};

/*
 * Helper function for makeVariableResponseGraph: given a graph and a
 * variable name, returns the axis label text associated with that variable.
 */
function getAxisTextForVariable (graph, variable) {
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
};

/***************************************************************************
 * 1. makeAnomalyGraph and its helper functions
 ***************************************************************************/
/*
 * Graph transformation function that accepts a graph containing one or more
 * timeseries associated with a single axis, and the name of one of the 
 * timeseries to use as a base. Adds a secondary y axis, graphing a data series
 * showing the difference (anomaly) between each of the original series and the
 * base series. (Including the base series itself, shown as a flat line.)
 * 
 * The anomaly series will have the same hue, but somewhat desaturated colour 
 * as the original series they represent.They will not appear in legends or 
 * tooltips, but their name (if needed for further graph manipulation)
 * will be "[original name] Anomaly."
 * 
 * This is intended to display change over time on a single graph.
 */

function makeAnomalyGraph (base, graph) {
  
  if(!_.isUndefined(graph.axis.y2)) {
    throw new Error("Error: Cannot calculate anomalies for multiple data types.");
  }
  
  const baseSeries = _.find(graph.data.columns, series => {return series[0] === base});
  if(_.isUndefined(baseSeries)) {
    throw new Error("Error: Invalid base data for anomaly calculation.");
  }
  
  const origLength = graph.data.columns.length;
  graph.data.axes = {};
  graph.axis.y2 = {show: true};
  
  for(let i = 0; i < origLength; i++) {
    if(graph.data.columns[i][0] !== 'x') {
      let oldSeries = graph.data.columns[i];
      if(oldSeries.length !== baseSeries.length) {
        throw new Error("Error: Incorrect data series length, cannot calculate anomaly");
      }

      let newSeries = [];
      newSeries.push(`${oldSeries[0]} Anomaly`);
      for(let j = 1; j < oldSeries.length; j++){
        newSeries.push(oldSeries[j] - baseSeries[j]);
      }
      graph.data.columns.push(newSeries);
      graph.data.axes[oldSeries[0]] = 'y';
      graph.data.axes[`${oldSeries[0]} Anomaly`] = 'y2';
      graph.data.types[`${oldSeries[0]} Anomaly`] = oldSeries[0] === base ? "line" : "bar";
    }
  }
  graph.axis.y2.label = {};
  graph.axis.y2.label.position = 'outer-middle';
  graph.axis.y2.label.text = `${getAxisTextForVariable(graph, baseSeries[0])} anomaly from ${baseSeries[0]}`;
  
  
  // function that determines whether a data series an anomaly series.
  // used to format anomalies differently than data
  function isAnomaly (series) {
    return caseInsensitiveStringSearch(series[0], "Anomaly");
  }
  
  // classifier function that matches each "anomaly" data series with
  // the nominal series it is based on. Used to match colours.
  function anomalyMatcher (series) {
    const sName = series[0];
    return isAnomaly(series) ? sName.substring(0, sName.length - 8) : sName;
  };  
  
  // ranking function that assigns anomaly series lower results than 
  // nominal series, used to make them distinguishable.
  function anomalyRanker (series) {
    return isAnomaly(series) ? .7 : 1;
  }
  
  //assign anomaly data series the same colour as the series they describe.
  graph = assignColoursByGroup(graph, anomalyMatcher);

  
  //remove anomaly series from tooltips and legends, lighten anomalies
  graph = hideSeriesInTooltip(graph, isAnomaly);
  graph = hideSeriesInLegend(graph, isAnomaly);
  graph = fadeSeriesByRank(graph, anomalyRanker);
  
  //show anomalies with nominal values in tooltip:
  graph.tooltip.format.value = addAnomalyTooltipFormatter(graph.tooltip.format.value, baseSeries);
  
  //move the two sets of data apart for less confusing visuals
  graph = padYAxis(graph, 'y2', 'top', 8);
  graph = padYAxis(graph, 'y', 'bottom', .2);
  
  return graph;
};

/*
 * Helper function for makeAnomalyGraph: takes an existing tool tip number
 * formatting function, and adds a wrapper which appends the anomaly from
 * the specified base series.
 */
function addAnomalyTooltipFormatter (oldFormatter, baseSeries) {  
  const newTooltipValueFormatter = function(value, ratio, id, index) {
    let nominal = oldFormatter(value, ratio, id, index);
    if(_.isUndefined(nominal)) { //this series doesn't display in tooltip.
      return undefined; 
    }
    else {
      const anomaly = value - baseSeries[index + 1];
      const sign = anomaly >= 0 ? "+" : "";
      return nominal + " (" + sign + anomaly.toPrecision(2) + ")";
    }
  };
  return newTooltipValueFormatter;
};

module.exports = { makeVariableResponseGraph, makeAnomalyGraph,
    //exported only for testing purposes:
    getAxisTextForVariable};
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
 ***************************************************************************/
import _ from 'underscore';
import {caseInsensitiveStringSearch} from './util';
import {fixedPrecision} from './chart-generators';

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
};

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
};

module.exports = { makeVariableResponseGraph,
    //exported only for testing purposes:
    getAxisTextForVariable};
/************************************************************************
 * chart-formatters.js - functions that modify a C3 chart specification
 *   to alter the way data is displayed to make charts more readable. These
 *   functions do not affect the data itself, only its formatting and display.
 * 
 * Each function in this file accepts a C3 graph specification object and a
 * segmentation function. The segmentation function will be applied to each
 * data series in the C3 graph object, with the results being used to decide
 * how to format data from that series. It returns the modified graph spec.
 * 
 * The functions in this file are:
 *  - assignColoursByGroup: assigns the same display colour to all data series
 *      belonging to the same group
 *      
 *  - fadeSeriesByRank: lightens the colours used to display data series assigned
 *      a lower rank, to make them less distracting from the "main" data.
 *      
 *  - hideSeriesInLegend: removes specific data series from the legend
 *  
 *  - sortSeriesByRank: draw higher ranked data series above (higher z-axis)
 *      lower ranked series
 ***************************************************************************/
import _ from 'underscore';
import {PRECISION,
        extendedDateToBasicDate,
        capitalizeWords,
        caseInsensitiveStringSearch,
        nestedAttributeIsDefined,
        getVariableOptions} from './util';
import chroma from 'chroma-js';

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
};

/*
 * Post-processing graph function that hides specific series from the tooltip.
 * 
 * Takes a graph specification object and a predicate. Any series for which
 * the predicate returns true will be blocked from appearing in the tooltip.
 * 
 * By default, every series appears in the tooltip. This postprocessor is 
 * only needed if you want one or more series NOT to be shown.
 */
var hideSeriesInTooltip = function(graph, predicate) {
  //determine which series do not appear in the tooltip
  let hidden = [];
  
  for(let i = 0; i < graph.data.columns.length; i++) {
    if(predicate(graph.data.columns[i])) {
      hidden.push(graph.data.columns[i][0]);
    }
  }

  //in order to have a value not show up in the tooltip, it needs to
  //render as undefined in the tooltip value formatting function. 
  //Return undefined for values in the series list made earlier.
  const oldTooltipValueFormatter = graph.tooltip.format.value;  
  const newTooltipValueFormatter = function(value, ratio, id, index) {
    if(hidden.indexOf(id) !== -1) {
      return undefined; 
    }
    else {
      return oldTooltipValueFormatter(value, ratio, id, index);
    }  
  };
  graph.tooltip.format.value = newTooltipValueFormatter;
  return graph;
}

/*
 * Post-processing graph function that adds extra space above or below
 * data on a graph by setting the y-axis maximums and minimums to multiples
 * of the data span. Especially useful if you have data on both the y1 and y2
 * axis, but don't want them to visually overlap.
 * 
 * Arguments:
 *   graph - the graph to be modified
 *   axis - either "y1" or "y2"
 *   direction - where to add padding, either "top" or "bottom"
 *   padding - the amount of extra y-axis space to add, expressed as a 
 *             multiple of the existing data span. 
 */
var padYAxis = function (graph, axis = "y", direction = "top", padding = 1) {
  if(padding <= 0) {
    throw new Error("Error: Graph axis padding value must be greater than 0");
  }
  
  if(direction != "top" && direction != "bottom") {
    throw new Error("Error: Unknown graph axis padding direction");
  }
  
  if(axis !== "y" && axis !== "y2") {
    throw new Error("Error: invalid scaling axis");
  }
  
  // if this graph does not yet have minimums and maximums defined, calculate
  // them from the data.
  let min = graph.axis[axis].min;
  let max = graph.axis[axis].max
  if(_.isUndefined(min)) {
    min = Infinity;
    for(let i = 0; i < graph.data.columns.length; i++) {
      let series = graph.data.columns[i];
      if(series[0] !== 'x' && graph.data.axes[series[0]] === axis) {
        const seriesMin = _.min(series);
        min = seriesMin < min ? seriesMin : min; 
      }
    }
  }
  
  if(_.isUndefined(max)) {
    max = -Infinity;
    for(let i = 0; i < graph.data.columns.length; i++) {
      let series = graph.data.columns[i];
      if(series[0] !== 'x' && graph.data.axes[series[0]] === axis) {
        const seriesMax = _.max(series);
        max = seriesMax > max ? seriesMax : max; 
      }
    }
  }
  
  if(direction === "top") {
    graph.axis[axis].max = max + (max - min) * padding;
  } else if(direction === "bottom") {
    graph.axis[axis].min = min - (max - min) * padding;
  } 
  return graph;
}

module.exports = { assignColoursByGroup, fadeSeriesByRank,
    hideSeriesInLegend, sortSeriesByRank, hideSeriesInTooltip,
    padYAxis};
/************************************************************************
 * chart-formatters.js - functions that modify a C3 chart specification
 *   to alter the way data is displayed to make charts more readable. These
 *   functions do not affect the data itself, only its formatting and display.
 * 
 * Data series format functions accept a C3 graph specification and a 
 * segmentation function. The segmentation function will be applied to each
 * data series in the C3 graph object, with the results being used to decide
 * how to format data from that series. 
 * 
 * Data series formatters:
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
 *      
 *  - hideSeriesInTooltip: removes specific data series from the tooltip
 * 
 * Axis formatters accept a C3 graph specification and additional parameters
 * that vary by function. They adjust formatting on graph axes.
 * 
 * Axis formatters:
 *  - padYAxis: add additional blank space above or below the data series
 *  
 *  - displayTicksByRange: only display axis ticks for specific parts of the
 *    data range
 ***************************************************************************/
import _ from 'underscore';
import {PRECISION,
        extendedDateToBasicDate,
        capitalizeWords,
        caseInsensitiveStringSearch,
        nestedAttributeIsDefined,
        getVariableOptions} from './util';
import chroma from 'chroma-js';


/****************************************************************************
 * 0. Data series formatters
 ****************************************************************************/
/*
 * Reiteration of D3's "category10" colors. They underlie c3's default
 * colours but are not directly accessible. Allows creating custom
 * colour palettes that use the same colors as the default assignments.
 */

const category10Colours = ["#1f77b4",
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
 * and assigned the same display colour. _.isEqual() is used (by _.indexOf()) 
 * to evaluate whether two segmentation results are equal.
 *
 * Returns a modified graph object with colours assigned in graph.data.colors
 * accordingly.
 *
 * Each data column is an array with the series name in the 0th location, example:
 *
 * ['Monthly Mean Tasmin', 30, 20, 50, 40, 60, 50, 10, 10, 20, 30, 40, 50]
 *
 */
function assignColoursByGroup (graph, segmentor, colourList = category10Colours) {
  let categories = [];
  let colors = {};

  for(let column of graph.data.columns) {
    const seriesName = column[0];
    if(seriesName !== "x") { //"x" series used to provide categories, not data.
      let category = segmentor(column);
      let index = _.indexOf(categories, category);
      if(index === -1) {
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
  }
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
function fadeSeriesByRank (graph, ranker) {

  let rankDictionary = {};

  for(let column of graph.data.columns) {
    const seriesName = column[0];
    if(seriesName !== "x") {
      rankDictionary[seriesName] = ranker(column);
    }
  }

  //c3 will pass the function the assigned colour, and either:
  //     * a string with the name of the time series (drawing legend)
  //     * an object with attributes about the time series (drawing a point or line)
  function fader (colour, d) {
    const scale = chroma.scale(['white', colour]);
    if(_.isObject(d)) { //d = data attributes
      return scale(rankDictionary[d.id]).hex();
    }
    else { //d = series name only
      return scale(rankDictionary[d]).hex();
    }
  };

  graph.data.color = fader;
  return graph;
}

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
function hideSeriesInLegend (graph, predicate) {
  let hiddenSeries = [];

  _.each(graph.data.columns, column => {
    const seriesName = column[0];
    if(seriesName !== "x" && predicate(column)) {
      hiddenSeries.push(seriesName);
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
function sortSeriesByRank (graph, ranker) {
  const sorter = function(a, b) {return ranker(a) - ranker(b);}
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
function hideSeriesInTooltip (graph, predicate) {
  //determine which series do not appear in the tooltip
  const hidden = _.pluck(_.filter(graph.data.columns, predicate),0);

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

/****************************************************************************
 * 1. Axis formatters
 ****************************************************************************/
/*
 * Helper function that returns an array of all data series associated with 
 * a specific y axis (y or y2). Ignores category or time series, if present.
 */
function getDataSeriesByAxis(graph, axis) {
  return _.filter(graph.data.columns, series => {
    const seriesName = series[0];
    return seriesName !== 'x' && graph.data.axes[seriesName] === axis;
  });
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
function padYAxis (graph, axis = "y", direction = "top", padding = 1) {
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
  const axisSeries = getDataSeriesByAxis(graph, axis);
  
  if(_.isUndefined(min)) {
    min = _.min(_.map(axisSeries, series => _.min(series)));
  }    
  
  if(_.isUndefined(max)) {
    max = _.max(_.map(axisSeries, series => _.max(series)));
  }
  
  if(direction === "top") {
    graph.axis[axis].max = max + (max - min) * padding;
  } else if(direction === "bottom") {
    graph.axis[axis].min = min - (max - min) * padding;
  } 
  return graph;
}

/*
 * Post-processing graph function that alters the graph to only display
 * numerical values for axis ticks inside a certain range. This is 
 * intended to help make it clearer which data series are
 * associated with which y axis in graphs with multiple axes.
 * 
 * If min and max are not specified, data range will be used.
 * 
 * By default, without this formatter, numerical values for all 
 * ticks are visible.
 */

function hideTicksByRange(graph, axis = "y", min, max) {
  const oldFormatFunction = graph.axis[axis].tick.format;
  const axisSeries = getDataSeriesByAxis(graph, axis);
  
  //if a range is not supplied, generate one from the data
  const genMin = _.isUndefined(min);
  const genMax = _.isUndefined(max);
  min = genMin ? _.min(_.map(axisSeries, series => _.min(series))) : min;
  max = genMax ? _.max(_.map(axisSeries, series => _.max(series))) : max;
  //expand generated axis range to include a ceiling or floor tick
  //(may not matter in very short or very tall graphs)
  min = genMin ? min - (max - min) / 4 : min;
  max = genMax ? max + (max - min) / 4 : max;
  
  function newFormatFunction(value) {
    if(value <= max && value >= min) {
      return oldFormatFunction(value);
    }
    else {
      return "";
    }
  };
  
  graph.axis[axis].tick.format = newFormatFunction;
  return graph;
}

module.exports = { assignColoursByGroup, fadeSeriesByRank,
    hideSeriesInLegend, sortSeriesByRank, hideSeriesInTooltip,
    padYAxis, hideTicksByRange,
    //helper functions exported only for testing:
    getDataSeriesByAxis
    };
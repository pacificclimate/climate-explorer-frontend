/* **********************************************************************
 * chart-accessors.js - functions that return information about a C3 chart
 *   spec without modifying it. Used by chart-displaying components to
 *   make decisions about how to format and display charts, without needing
 *   to understand or access the internals of charts.
 *
 * Reference on the C3 chart format can be found at https://c3js.org
 ***************************************************************************/
import _ from 'underscore';

export function hasTwoYAxes(graph) {
  // returns true if this graph has a both a y and y2 axis defined
  return !_.isUndefined(graph.axis.y2) && !_.isUndefined(graph.axis.y2);
}

export function checkYAxisValidity(graph, axis) {
  // helper function that throws an error if the given y axis is
  // not present in the graph spec.
  if (_.isUndefined(graph.axis[axis])) {
    throw new Error('Error: invalid axis ' + axis);
  }
}

export function yAxisUnits(graph, axis) {
  // returns the units associated with a y-axis, which are set by
  // chart-generators.assignDataToYAxis(). If a chart was generated
  // without using assignDataToYAxis(), or put through a graph transform
  // that affects axis attributes to remove units, it returns undefined.
  // Currently all CE graphs use assignDataToYAxis()
  checkYAxisValidity(graph, axis);
  return graph.axis[axis].units;
}

export function yAxisRange(graph, axis) {
  // returns an object containing the maximum and minimum of all
  // data series associated with a particular y-axis,
  // like {max: 10, min: 0}
  checkYAxisValidity(graph, axis);
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < graph.data.columns.length; i++) {
    if (axis === graph.data.axes[graph.data.columns[i][0]]) {
      min = Math.min(min, _.min(graph.data.columns[i]));
      max = Math.max(max, _.max(graph.data.columns[i]));
    }
  }
  return {
    min: min,
    max: max,
  };
}

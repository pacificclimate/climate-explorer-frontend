/* **********************************************************************
 * chart-accessors.js - functions that return information about a C3 chart
 *   spec without modifying it. Used by chart-displaying components to
 *   make decisions about how to format and display charts, without needing
 *   to understand or access the internals of charts.
 *
 * Reference on the C3 chart spec format can be found at https://c3js.org
 ***************************************************************************/
import _ from "lodash";

// C3 data series are an array containing a string axis label followed by the
// (numeric) data values for the axis. This function returns the data.
export const seriesData = (series) => _.drop(series, 1);

export function hasTwoYAxes(graph) {
  // returns a truthy object if this graph has a both a y and y2 axis defined
  return !!(graph.axis.y && graph.axis.y2);
}

export function checkYAxisValidity(graph, axis) {
  // helper function that throws an error if the named (typically "y" or "y2")
  // y axis is not present in the graph spec.
  if (!graph.axis[axis]) {
    throw new Error("Error: invalid axis " + axis);
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
  // data series in this graph spec associated with a particular
  // y-axis. The axis argument is typically either "y" or "y2".
  // Return value has the format {max: 10, min: 0}
  checkYAxisValidity(graph, axis);

  // Filter to just the data points associated with this y axis.
  const axisData = _.flattenDeep(
    // deep flattening may not be required here
    _.map(
      graph.data.columns.filter((ser) => axis === graph.data.axes[ser[0]]),
      seriesData,
    ),
  );

  return {
    min: _.min(axisData),
    max: _.max(axisData),
  };
}

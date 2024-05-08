/****************************************************************************
 * AnomalyAnnualCycleGraph.js - contrast present and future climatology values
 *
 * Given a data specification (model_id, experiment, variable_id),
 * provides functions to help generate a graph specification contrasting
 * a baseline historical climatology and future Annual Cycle data:
 *
 *   - getMetadata locates metadata for multiple three climatology periods
 *   - dataToGraphSpec formats a graph to shade the climatology periods
 *
 * Similar to SingleAnnualCycleGraph, but instead of displaying the annual
 * cycle at multiple time resolutions (yearly, seasonal, monthly), the annual
 * cycle is displayed for different climatology periods.
 ****************************************************************************/

import React from "react";

import _ from "lodash";

import { timeseriesToAnnualCycleGraph } from "../../core/chart-generators";
import { makeAnomalyGraph } from "../../core/chart-transformers";
import AnnualCycleGraph from "./AnnualCycleGraph";

export default function AnomalyAnnualCycleGraph(props) {
  function getDateRangeMetadatas(start = undefined, end = undefined) {
    // returns metadata for all datasets whose model, experiment, and variable
    // match the values specified in props, and whose start year is greater
    //than start, and whose end year is less than end.
    //the interval is exclusive. optionally leave either endpoint undefined.
    return _.filter(props.meta, (md) => {
      return (
        md.model_id === props.model_id &&
        md.experiment === props.experiment &&
        md.variable_id === props.variable_id &&
        (_.isUndefined(end) || md.end_date < end) &&
        (_.isUndefined(start) || md.start_date > start)
      );
    });
  }

  function currentYear() {
    return new Date().getFullYear();
  }

  function getMetadata(dataSpec) {
    //Select a base historical dataset to be the baseline.
    //The most recent dataset that does *not* include the present date is
    //used (usually 1981 - 2010). if there are two equally recent datasets
    //(such as 1971-2000 and 1981-2000) for some reason, one will be arbitrarily selected.
    let historicalMetadatas = getDateRangeMetadatas(undefined, currentYear());
    const end_date = _.maxBy(_.map(historicalMetadatas, "end_date"), (v) => +v);
    historicalMetadatas = _.filter(historicalMetadatas, { end_date });

    //pick the highest-resolution dataset available for that climatology
    const baselineMetadata =
      _.find(historicalMetadatas, { timescale: "monthly" }) ||
      _.find(historicalMetadatas, { timescale: "seasonal" }) ||
      _.find(historicalMetadatas, { timescale: "yearly" });

    //return the baseline dataset and every same-resolution dataset that starts after it.
    if (_.isUndefined(baselineMetadata)) {
      return [];
    } else {
      let anomalyMetadatas = getDateRangeMetadatas(
        baselineMetadata.start_date,
        undefined,
      );
      anomalyMetadatas = _.filter(anomalyMetadatas, {
        timescale: baselineMetadata.timescale,
      });
      return [baselineMetadata].concat(anomalyMetadatas);
    }
  }

  function dataToGraphSpec(meta, data) {
    let graph = timeseriesToAnnualCycleGraph(meta, ...data);
    // Select the lowest starting year as the base series for the anomaly graph
    let seriesNames = _.without(
      graph.data.columns.map((series) => _.first(series)),
      "x",
    );
    seriesNames.sort();
    graph = makeAnomalyGraph(seriesNames[0], props.variable_id, graph);
    return graph;
  }

  const graphProps = _.pick(
    props,
    "model_id",
    "variable_id",
    "experiment",
    "area",
  );

  return (
    <AnnualCycleGraph
      {...graphProps}
      meta={getDateRangeMetadatas(undefined, currentYear())}
      getMetadata={getMetadata}
      dataToGraphSpec={dataToGraphSpec}
    />
  );
}

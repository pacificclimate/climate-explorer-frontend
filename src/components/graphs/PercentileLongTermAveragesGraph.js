/***********************************************************
 * PercentileLongTermAverageGraph.js
 *
 * Displays long term change of a mean and percentiles for an
 * ensemble of models.
 ************************************************************/
import React from "react";

import _ from "lodash";

import { dataToLongTermAverageGraph } from "../../core/chart-generators";
import { timeKeyToResolutionIndex } from "../../core/util";
import LongTermAveragesGraph from "./LongTermAveragesGraph";

export default function PercentileLongTermAveragesGraph(props) {
  function getMetadata(timeOfYear) {
    // get a list of all available percentiles
    function parsePercentile(metad) {
      const clim_stat = metad["climatological_statistic"];
      if (_.startsWith(clim_stat, "percentile")) {
        return parseFloat(_.trim(_.replace(clim_stat, "percentile", ""), "[]"));
      } else return null;
    }
    const percentiles = _.uniq(_.map(props.percentileMeta, parsePercentile));

    const metadataFromProps = _.pick(
      props,
      "ensemble_name",
      "model_id",
      "variable_id",
      "experiment",
      "area",
    );

    //metadata for the ensemble mean - need to include blank percentile attribute
    //due to the way that series names are automatically generated on the
    //graph from the attributes that differ between series. This non-percentile
    //data series will still have its "percentile" value included in the legend.
    let apiCalls = [
      {
        ...metadataFromProps,
        ...timeKeyToResolutionIndex(timeOfYear),
        climatological_statistic: "mean",
        percentile: "",
      },
    ];

    //Add an additional metadata object for each percentile
    if (percentiles.length > 0) {
      _.forEach(percentiles, function (p) {
        apiCalls.push({
          ...metadataFromProps,
          ...timeKeyToResolutionIndex(timeOfYear),
          climatological_statistic: "percentile",
          percentile: p,
        });
      });
    }
    return apiCalls;
  }

  function dataToGraphSpec(data, meta) {
    // Convert `data` (described by `meta`) to a graph specification compatible
    // with `DataGraph`.
    return dataToLongTermAverageGraph(data, meta);
  }

  const graphProps = _.pick(
    props,
    "model_id",
    "variable_id",
    "experiment",
    "meta",
    "area",
    "hideTimeOfYearSelector",
  );

  return (
    <LongTermAveragesGraph
      {...graphProps}
      getMetadata={getMetadata}
      dataToGraphSpec={dataToGraphSpec}
    />
  );
}

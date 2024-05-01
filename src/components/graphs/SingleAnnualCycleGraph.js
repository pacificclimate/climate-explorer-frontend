import React from "react";

import _ from "lodash";

import { timeseriesToAnnualCycleGraph } from "../../core/chart-generators";
import { sortSeriesByRank } from "../../core/chart-formatters";

import AnnualCycleGraph from "./AnnualCycleGraph";

export default function SingleAnnualCycleGraph(props) {
  function getMetadata(dataSpec) {
    // Find and return metadata matching the parameters in the dataSpec:
    // model_id, experiment, variable_id (supplied by parent)
    // start_date, end_date, ensemble_name (chosen by this component)
    // for monthly, seasonal and annual timescales.

    const { model_id, experiment, variable_id, meta } = props;

    var findMetadataForResolution = function (resolution) {
      return _.find(meta, {
        model_id,
        experiment,
        variable_id,
        ...dataSpec,
        timescale: resolution,
      });
    };

    const monthlyVariableMetadata = findMetadataForResolution("monthly");
    const seasonalVariableMetadata = findMetadataForResolution("seasonal");
    const yearlyVariableMetadata = findMetadataForResolution("yearly");

    const metadataSets = _.compact([
      monthlyVariableMetadata,
      seasonalVariableMetadata,
      yearlyVariableMetadata,
    ]);
    return metadataSets;
  }

  function dataToGraphSpec(meta, data) {
    // Convert `data` (described by `meta`) to a graph specification compatible
    // with `DataGraph`.
    let graph = timeseriesToAnnualCycleGraph(meta, ...data);

    // arrange the graph so that the highest-resolution data is most visible.
    function rankByTimeResolution(series) {
      var resolutions = ["Yearly", "Seasonal", "Monthly"];
      for (let i = 0; i < 3; i++) {
        if (series[0].search(resolutions[i]) !== -1) {
          return i;
        }
      }
      return 0;
    }
    graph = sortSeriesByRank(graph, rankByTimeResolution);

    return graph;
  }

  const graphProps = _.pick(
    props,
    "model_id",
    "variable_id",
    "experiment",
    "meta",
    "area",
  );

  return (
    <AnnualCycleGraph
      {...graphProps}
      getMetadata={getMetadata}
      dataToGraphSpec={dataToGraphSpec}
    />
  );
}

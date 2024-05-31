import React from "react";

import _ from "lodash";

import { dataToLongTermAverageGraph } from "../../core/chart-generators";
import { emphasizeSeries } from "./graph-helpers";
import ContextGraph from "./ContextGraph";

export default function SingleContextGraph(props) {
  function getMetadata() {
    const {
      ensemble_name,
      experiment,
      variable_id,
      area,
      contextMeta,
      model_id,
    } = props;

    // Array of unique model_id's
    const uniqueContextModelIds = _.uniq(_.map(contextMeta, "model_id"));

    //we prefer the lowest possible time resolution for this graph, since it's
    //used to provide broad context, not detailed data. But if the
    //selected dataset doesn't have yearly data, use whatever resolution it has.
    const model_metadata = _.filter(contextMeta, {
      model_id: model_id,
      multi_year_mean: true,
    });
    const resolutions = _.uniq(_.map(model_metadata, "timescale")).sort();
    const timescale = resolutions[resolutions.length - 1];

    const baseMetadata = {
      ensemble_name,
      experiment,
      variable_id,
      area,
      timescale: timescale,
      timeidx: 0,
      multi_year_mean: true,
    };
    const metadatas = uniqueContextModelIds
      .map((model_id) => ({ ...baseMetadata, model_id }))
      .filter(
        (metadata) =>
          // Note: length > 0 guaranteed for item containing props.model_id
          _.filter(
            contextMeta,
            _.omit(metadata, "ensemble_name", "timeidx", "area"),
          ).length > 0,
      );
    return metadatas;
  }

  function dataToGraphSpec(meta, data, selectedModelId) {
    // Convert `data` (described by `meta`) to a graph specification compatible
    // with `DataGraph`.
    let graph = dataToLongTermAverageGraph(data, meta);
    graph = emphasizeSeries(graph, selectedModelId);

    // Simplify graph by connecting missing data gaps
    graph.line.connectNull = true;
    return graph;
  }

  const graphProps = _.pick(
    props,
    "model_id",
    "variable_id",
    "experiment",
    "contextMeta",
    "area",
  );

  return (
    <ContextGraph
      {...graphProps}
      getMetadata={getMetadata}
      dataToGraphSpec={dataToGraphSpec}
    />
  );
}

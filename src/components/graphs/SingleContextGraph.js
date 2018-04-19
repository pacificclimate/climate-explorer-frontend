import React from 'react';

import _ from 'underscore';

import { dataToLongTermAverageGraph } from '../../core/chart-generators';
import { emphasizeSeries } from './graph-helpers';
import { assignColoursByGroup, fadeSeriesByRank,
         hideSeriesInLegend, sortSeriesByRank } from '../../core/chart-formatters';
import ContextGraph from './ContextGraph';


export default function SingleContextGraph(props) {
  function getMetadata() {
    const {
      ensemble_name, experiment, variable_id, area, contextMeta,
    } = props;

    // Array of unique model_id's
    const uniqueContextModelIds = _.uniq(_.pluck(contextMeta, 'model_id'));
    const baseMetadata = {
      ensemble_name,
      experiment,
      variable_id,
      area,
      timescale: 'yearly',
      timeidx: 0,
      multi_year_mean: true,
    };
    const metadatas =
      uniqueContextModelIds
        .map(model_id => ({ ...baseMetadata, model_id }))
        .filter(metadata =>
          // Note: length > 0 guaranteed for item containing props.model_id
          _.where(contextMeta,
            _.omit(metadata, 'ensemble_name', 'timeidx', 'area')
          ).length > 0
        );
    return metadatas;
  }

  function dataToGraphSpec(meta, data, selectedModelId) {
    // Convert `data` (described by `meta`) to a graph specification compatible
    // with `DataGraph`.
    let graph = dataToLongTermAverageGraph(data, meta);
    graph = emphasizeSeries(graph, selectedModelId);

    //simplify graph by turning off tooltip and missing data gaps
    graph.line.connectNull = true;
    graph.tooltip = { show: false };
    return graph;
  }

  const graphProps = _.pick(props,
    'model_id', 'variable_id', 'experiment', 'contextMeta', 'area'
  );

  return (
    <ContextGraph
      {...graphProps}
      getMetadata={getMetadata}
      dataToGraphSpec={dataToGraphSpec}
    />
  );
}

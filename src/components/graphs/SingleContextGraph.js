import React from 'react';

import _ from 'underscore';

import {
  assignColoursByGroup,
  dataToLongTermAverageGraph, fadeSeriesByRank, hideSeriesInLegend,
  sortSeriesByRank,
} from '../../core/chart';
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

    const emphasizeCurrentModel = function(graph) {
      // Classify data series by which model generated them
      const makeModelSegmentor = function (selectedModelOutput, otherModelOutput) {
        return function(dataseries) {
          return dataseries[0].search(selectedModelId) !== -1 ?
            selectedModelOutput :
            otherModelOutput;
        };
      };

      graph = assignColoursByGroup(graph, makeModelSegmentor(1, 0));
      graph = fadeSeriesByRank(graph, makeModelSegmentor(1, 0.35));
      graph = hideSeriesInLegend(graph, makeModelSegmentor(false, true));
      graph = sortSeriesByRank(graph, makeModelSegmentor(1, 0));

      //simplify graph by turning off tooltip and missing data gaps
      graph.line.connectNull = true;
      graph.tooltip = { show: false };
      return graph;
    };

    return emphasizeCurrentModel(dataToLongTermAverageGraph(data, meta));
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

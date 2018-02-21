import React from 'react';

import _ from 'underscore';

import { sortSeriesByRank, timeseriesToAnnualCycleGraph } from '../../core/chart';
import { findMatchingMetadata } from './graph-helpers';
import AnnualCycleGraph from './AnnualCycleGraph';


export default function SingleAnnualCycleGraph(props) {
  function getMetadata(instance) {
    // Find and return metadata matching model_id, experiment, variable_id
    // and instance (start_date, end_date, ensemble_name) for monthly, seasonal
    // and annual timescales.

    const {
      model_id, experiment,
      variable_id, meta,
    } = props;
    
    var findMetadataForResolution = function (resolution) {
      return _.findWhere(meta, {
        model_id, experiment, variable_id,
        ...instance,
        timescale: resolution,
        });
    }

    const monthlyVariableMetadata = findMetadataForResolution('monthly');
    const seasonalVariableMetadata = findMetadataForResolution('seasonal');
    const yearlyVariableMetadata = findMetadataForResolution('yearly');
    
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
      var resolutions = ['Yearly', 'Seasonal', 'Monthly'];
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

  const graphProps = _.pick(props,
    'model_id', 'variable_id', 'experiment', 'meta', 'area'
  );

  return (
    <AnnualCycleGraph
      {...graphProps}
      getMetadata={getMetadata}
      dataToGraphSpec={dataToGraphSpec}
    />
  );
}

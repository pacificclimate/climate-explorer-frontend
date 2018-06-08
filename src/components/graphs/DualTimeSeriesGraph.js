import React from 'react';

import _ from 'underscore';

import { timeseriesToTimeseriesGraph } from '../../core/chart-generators';
import TimeSeriesGraph from './TimeSeriesGraph';


export default function DualTimeSeriesGraph(props) {
  function getMetadata() {
    const {
      model_id, experiment,
      variable_id, meta,
      comparand_id, comparandMeta,
    } = props;

    // Set up metadata sets for primary variable
    const primaryVariableMetadata = _.findWhere(meta, {
      model_id, experiment, variable_id,
    });

    let metadataSets = [primaryVariableMetadata];

    // Extend metadata sets with comparand, if present and different from variable
    const secondaryVariableMetadata = _.findWhere(comparandMeta, {
      model_id,
      experiment,
      variable_id: comparand_id,
    });
    if (
      primaryVariableMetadata && secondaryVariableMetadata &&
      primaryVariableMetadata.unique_id !== secondaryVariableMetadata.unique_id
    ) {
      metadataSets.push(secondaryVariableMetadata);
    }

    return metadataSets;
  }

  function dataToGraphSpec(meta, data) {
    // Convert `data` (described by `meta`) to a graph specification compatible
    // with `DataGraph`.
    return timeseriesToTimeseriesGraph(meta, ...data);
  }

  const graphProps = _.pick(props,
    'model_id', 'variable_id', 'comparand_id', 'experiment', 'meta', 'comparandMeta', 'area'
  );

  return (
    <TimeSeriesGraph
      {...graphProps}
      getMetadata={getMetadata}
      dataToGraphSpec={dataToGraphSpec}
    />
  );
}

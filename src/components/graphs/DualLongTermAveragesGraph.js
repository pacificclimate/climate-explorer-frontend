import React from 'react';

import _ from 'underscore';

import { dataToLongTermAverageGraph } from '../../core/chart-generators';
import { timeKeyToResolutionIndex } from '../../core/util';
import LongTermAveragesGraph from './LongTermAveragesGraph';


export default function DualLongTermAveragesGraph(props) {
  function getMetadata(timeOfYear) {
    // Return metadata for variable_id and, if present and different, for
    // comparand_id.
    const commonMetadataFromProps = _.pick(props,
      'ensemble_name', 'model_id', 'experiment', 'area'
    );
    const timeResolutionAndIndex = timeKeyToResolutionIndex(timeOfYear);

    let result = [{
      ...commonMetadataFromProps,
      ...timeResolutionAndIndex,
      variable_id: props.variable_id,
    }];

    if (props.comparand_id && props.comparand_id !== props.variable_id) {
      result.push({
        ...commonMetadataFromProps,
        ...timeResolutionAndIndex,
        variable_id: props.comparand_id,
      });
    }
    return result;
  }

  function dataToGraphSpec(data, context) {
    // Convert `data` (described by `meta`) to a graph specification compatible
    // with `DataGraph`.
    return dataToLongTermAverageGraph(data, context);
  }

  const graphProps = _.pick(props,
    'model_id', 'variable_id', 'comparand_id', 'experiment', 'meta', 'comparandMeta', 'area'
  );

  return (
    <LongTermAveragesGraph
      {...graphProps}
      getMetadata={getMetadata}
      dataToGraphSpec={dataToGraphSpec}
    />
  );
}

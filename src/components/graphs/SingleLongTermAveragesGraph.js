import React from 'react';

import _ from 'lodash';

import { dataToLongTermAverageGraph } from '../../core/chart-generators';
import { timeKeyToResolutionIndex } from '../../core/util';
import LongTermAveragesGraph from './LongTermAveragesGraph';


export default function SingleLongTermAveragesGraph(props) {
  function getMetadata(timeOfYear) {
    const metadataFromProps = _.pick(props,
      'ensemble_name', 'model_id', 'variable_id', 'experiment', 'area'
    );
    // Yes, the value of this function is an array of one element.
    return [
      { ...metadataFromProps, ...timeKeyToResolutionIndex(timeOfYear) },
    ];
  }

  function dataToGraphSpec(data, meta) {
    // Convert `data` (described by `meta`) to a graph specification compatible
    // with `DataGraph`.
    return dataToLongTermAverageGraph(data, meta);
  }

  const graphProps = _.pick(props,
    'model_id', 'variable_id', 'experiment', 'meta', 'area'
  );

  return (
    <LongTermAveragesGraph
      {...graphProps}
      getMetadata={getMetadata}
      dataToGraphSpec={dataToGraphSpec}
    />
  );
}

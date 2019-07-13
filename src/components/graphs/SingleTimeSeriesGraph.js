import React from 'react';

import _ from 'lodash';

import { timeseriesToTimeseriesGraph } from '../../core/chart-generators';
import TimeSeriesGraph from './TimeSeriesGraph';


export default function SingleTimeSeriesGraph(props) {
  function getMetadata() {
    const {
      model_id, experiment,
      variable_id, meta,
    } = props;

    const primaryVariableMetadata = _.find(meta, {
      model_id, experiment, variable_id,
    });
    // Yes, the value of this function is an array of one element.
    const metadataSets = [primaryVariableMetadata];
    return metadataSets;
  }

  function dataToGraphSpec(meta, data) {
    // Convert `data` (described by `meta`) to a graph specification compatible
    // with `DataGraph`.
    return timeseriesToTimeseriesGraph(meta, ...data);
  }

  const graphProps = _.pick(props,
    'model_id', 'variable_id', 'experiment', 'meta', 'area'
  );

  return (
    <TimeSeriesGraph
      {...graphProps}
      getMetadata={getMetadata}
      dataToGraphSpec={dataToGraphSpec}
    />
  );
}

import React from 'react';

import _ from 'underscore';

import {
  assignColoursByGroup, fadeSeriesByRank, timeseriesToAnnualCycleGraph,
} from '../../core/chart';
import { findMatchingMetadata } from './graph-helpers';
import AnnualCycleGraph from './AnnualCycleGraph';


export default function DualAnnualCycleGraph(props) {
  function getMetadata(instance) {
    // Find and return metadata matching model_id, experiment, variable_id
    // and instance (start_date, end_date, ensemble_name) for monthly, seasonal
    // and annual timescales.
    // Do the the same for comparand_id and comparandMeta.

    const {
      model_id, experiment,
      variable_id, meta,
      comparand_id, comparandMeta,
    } = props;

    // Set up metadata sets for variable
    const monthlyVariableMetadata = _.findWhere(meta, {
      model_id, experiment, variable_id,
      ...instance,
      timescale: 'monthly',
    });
    const seasonalVariablelMetadata = findMatchingMetadata(
      monthlyVariableMetadata, { timescale: 'seasonal' }, meta
    );
    const yearlyVariableMetadata = findMatchingMetadata(
      monthlyVariableMetadata, { timescale: 'yearly' }, meta
    );

    let metadataSets = [
      monthlyVariableMetadata,
      seasonalVariablelMetadata,
      yearlyVariableMetadata,
    ];

    // Extend metadata sets with comparand, if present and different from variable
    const monthlyComparandMetadata = findMatchingMetadata(
      monthlyVariableMetadata, { variable_id: comparand_id }, comparandMeta
    );

    if (
      monthlyVariableMetadata && monthlyComparandMetadata &&
      monthlyComparandMetadata.unique_id !== monthlyVariableMetadata.unique_id
    ) {
      const seasonalComparandlMetadata = findMatchingMetadata(
        monthlyComparandMetadata, { timescale: 'seasonal' }, comparandMeta
      );
      const yearlyComparandMetadata = findMatchingMetadata(
        monthlyComparandMetadata, { timescale: 'yearly' }, comparandMeta
      );

      metadataSets = metadataSets.concat([
        monthlyComparandMetadata,
        seasonalComparandlMetadata,
        yearlyComparandMetadata,
      ]);
    }

    return metadataSets;
  }

  function dataToGraphSpec(meta, data) {
    // Convert `data` (described by `meta`) to a graph specification compatible
    // with `DataGraph`.

    let graph = timeseriesToAnnualCycleGraph(meta, ...data);

    // function that assigns each data series to one of two groups based on
    // which variable it represents. Passed to assignColoursByGroup to assign
    // graph line colors.
    const sortByVariable = dataSeries => {
      const seriesName = dataSeries[0].toLowerCase();
      if (seriesName.search(props.variable_id) !== -1) {
        return 0;
      } else if (seriesName.search(props.comparand_id) !== -1) {
        return 1;
      } else {
        // if only one variable is selected, it won't be in any series names.
        return seriesName;
      }
    };

    graph = assignColoursByGroup(graph, sortByVariable);

    //function that assigns seasonal and annual timeseries lower "rank"
    //then monthly timeseries. Passed to fadeSeries to make higher-resolution
    //data stand out more.
    const rankByTimeResolution = (dataSeries) => {
      var seriesName = dataSeries[0].toLowerCase();
      if (seriesName.search('monthly') !== -1) {
        return 1;
      } else if (seriesName.search('seasonal') !== -1) {
        return 0.6;
      } else if (seriesName.search('yearly') !== -1) {
        return 0.3;
      }
      //no time resolution indicated in timeseries. default to full rank.
      return 1;
    };

    graph = fadeSeriesByRank(graph, rankByTimeResolution);

    return graph;
  }

  const graphProps = _.pick(props,
    'model_id', 'variable_id', 'experiment', 'meta', 'area'
  );

  return (
    <AnnualCycleGraph
      {...graphProps}
      getInstanceMetadata={getMetadata}
      dataToGraphSpec={dataToGraphSpec}
    />
  );
}

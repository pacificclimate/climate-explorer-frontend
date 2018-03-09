import React from 'react';

import _ from 'underscore';

import {
  assignColoursByGroup, fadeSeriesByRank, timeseriesToAnnualCycleGraph,
} from '../../core/chart';
import { findMatchingMetadata } from './graph-helpers';
import AnnualCycleGraph from './AnnualCycleGraph';


export default function DualAnnualCycleGraph(props) {
  function getMetadata(dataSpec) {

    // Find and return metadata matching the data specification ("dataSpec"): 
    // model_id, experiment, variable_id, start_date, end_date, ensemble_member
    // for monthly, seasonal and annual timescales.
    // Variable, model, and experiment are supplied by the graph's parent, but 
    // start, end, and run are selected here.
    // Do the the same for comparand_id and comparandMeta.

    const {
      model_id, experiment,
      variable_id, meta,
      comparand_id, comparandMeta,
    } = props;

    var findMetadataForDataSpec = function (variable, timeres, metadataList) {
      return _.findWhere(metadataList, {
        model_id, experiment,
        ...dataSpec,
        timescale: timeres,
        variable_id: variable
        });
    }
  
    // Set up metadata sets for variable
    const monthlyVariableMetadata = findMetadataForDataSpec(variable_id, 'monthly', meta);
    const seasonalVariableMetadata = findMetadataForDataSpec(variable_id, 'seasonal', meta);
    const yearlyVariableMetadata = findMetadataForDataSpec(variable_id, 'yearly', meta);

    let metadataSets =[
      monthlyVariableMetadata,
      seasonalVariableMetadata,
      yearlyVariableMetadata,
    ];

    // Extend metadata sets with comparand, if different from variable
    // Include only comparand time resolutions present for the variable.
    if(variable_id !== comparand_id) {
      if(monthlyVariableMetadata) {
        metadataSets = metadataSets.concat(
            findMetadataForDataSpec(comparand_id, 'monthly', comparandMeta));
      }
      if(seasonalVariableMetadata) {
       metadataSets = metadataSets.concat(
           findMetadataForDataSpec(comparand_id, 'seasonal', comparandMeta));
      }
      if(yearlyVariableMetadata) {
        metadataSets = metadataSets.concat(
            findMetadataForDataSpec(comparand_id, 'yearly', comparandMeta));
      }
    }    
    return _.compact(metadataSets);
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
      if (seriesName.search(props.variable_id.toLowerCase()) !== -1) {
        return 0;
      } else if (seriesName.search(props.comparand_id.toLowerCase()) !== -1) {
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
      getMetadata={getMetadata}
      dataToGraphSpec={dataToGraphSpec}
    />
  );
}

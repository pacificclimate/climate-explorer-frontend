import React from 'react';

import _ from 'underscore';

import {timeseriesToAnnualCycleGraph} from '../../core/chart-generators';
import {assignColoursByGroup,
        fadeSeriesByRank,
        padYAxis} from '../../core/chart-formatters';
import { findMatchingMetadata } from './graph-helpers';
import AnnualCycleGraph from './AnnualCycleGraph';
import { getVariableOptions } from '../../core/util';


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

    // In a few cases, different variables move in lockstep over the course of
    // the year, e.g tasmin and tasmax: tasmin is almost always about 10
    // degrees lower than tasmax. These pairs of variables will be hard to
    // understand in a comparison graph, because c3's normally excellent
    // smart formatting will automatically scale each data set vertically
    // to take advantage of the entire graph space, making the two sets of
    // graph lines nearly identical.
    //
    // The variable configuration file indicates which pairs of variables are
    // expected to have this issue. If either of the two currently displayed
    // variables lists the other as a visual conflict (using the "shiftAnnualCycle"
    // attribute), they will be detangled by padding the graph y-scales to
    // shift the graph lines apart vertically.
    if(!_.isUndefined(graph.axis.y2)
        && props.comparand_id !== props.variable_id) {
      // see if either variable is listed as conflicting with the other
      let overlap = false;
      const variableOverlaps = getVariableOptions(props.variable_id, "shiftAnnualCycle");
      if(variableOverlaps && variableOverlaps.includes(props.comparand_id)) {
        overlap = true;
      }
      const comparandOverlaps = getVariableOptions(props.comparand_id, "shiftAnnualCycle");
      if(comparandOverlaps && comparandOverlaps.includes(props.variable_id)) {
        overlap = true;
      }
      if(overlap) {
        // find which set of data series has larger values;
        // the larger-valued will be shifted upward
        let maximum = -Infinity;
        let maxName = "";
        for(let i = 0; i < graph.data.columns.length; i++) {
          const series = graph.data.columns[i];
          const seriesMax = _.max(series);
          if(seriesMax > maximum) {
            maximum = seriesMax;
            maxName = series[0];
          }
        }
        const upAxis = graph.data.axes[maxName];
        const downAxis = upAxis === 'y' ? 'y2' : 'y';
        graph = padYAxis(graph, upAxis, "bottom", .2);
        graph = padYAxis(graph, downAxis, "top", .2);
      }
    }
    return graph;
  }

  const graphProps = _.pick(props,
    'model_id', 'variable_id', 'comparand_id', 'experiment', 'meta', 'comparandMeta', 'area'
  );

  return (
    <AnnualCycleGraph
      {...graphProps}
      getMetadata={getMetadata}
      dataToGraphSpec={dataToGraphSpec}
    />
  );
}

/*********************************************************************
 * DualDataController.js - controller component for numerical display
 * of two variables at once.
 *
 * Receives a model, experiment, and two variables from its parent,
 * DualController. Provides widgets for users to select a specific slice
 * of the data (timespan or run). Queries the API to fetch data on
 * both variables for the DataGraph viewers it manages, Annual Cycle Graph,
 * Long Term Average Graph, and Timeseries Graph, to show comparisons of
 * the two variables.
 *
 * If a user selects two variables that come from multi year mean datasets,
 * an Annual Graph and a Long Term Average Graph will be displayed. If a
 * user selects two variables that are not multi year means, the less
 * structured Timeseries Graph will be displayed.
 *
 * Selecting one multi year mean dataset and one nominal time dataset
 * displays an error message, as comparing these is not as simple as
 * plotting them on the same graph.
 *
 * The main variable is internally referred to as "variable" the
 * variable being compared to it is the "comparand." Available data
 * is based on the main variable; it's possible to display a dataset with
 * the main variable when the comparand is lacking matching data,
 * but not vice versa.
 *
 * Also allows downloading of the data displayed in the graphs.
 *********************************************************************/

import PropTypes from 'prop-types';

import React from 'react';
import createReactClass from 'create-react-class';
import { Tab, Tabs } from 'react-bootstrap';
import _ from 'underscore';


import { parseBootstrapTableData,
         timeKeyToResolutionIndex,
         resolutionIndexToTimeKey} from '../../core/util';
import{ timeseriesToAnnualCycleGraph,
        dataToLongTermAverageGraph,
        timeseriesToTimeseriesGraph,
        assignColoursByGroup,
        fadeSeriesByRank} from '../../core/chart';
import DataControllerMixin from '../DataControllerMixin';
import AnnualCycleGraph from '../graphs/AnnualCycleGraph';
import LongTermAveragesGraph from '../graphs/LongTermAveragesGraph';
import TimeSeriesGraph from '../graphs/TimeSeriesGraph';

import styles from './DualDataController.css';
import {
  findMatchingMetadata,
  multiYearMeanSelected,
} from '../graphs/graph-helpers';

var DualDataController = createReactClass({
  displayName: 'DualDataController',

  propTypes: {
    ensemble_name: PropTypes.string,
    model_id: PropTypes.string,
    variable_id: PropTypes.string,
    comparand_id: PropTypes.string,
    experiment: PropTypes.string,
    area: PropTypes.string,
    meta: PropTypes.array,
    comparandMeta: PropTypes.array,
  },

  mixins: [DataControllerMixin],

  getInitialState: function () {
    return {
      statsData: undefined,
    };
  },

  // TODO: Remove when DataControllerMixin is removed
  /*
   * Called when Dual Data Controller is loaded. Loads initial data to
   * display in the Long Term Average graph, Timeseries graph, or the
   * Annual Cycle graph. Defaults to monthly resolution and January time index.
   *
   * If both datasets are multi year means, the annual cycle graph and
   * long-term average graph will be displayed. If neither dataset is
   * a multi year mean, the timeseries graph will be displayed instead.
   *
   * There's no default for start date, end date, or ensemble member
   * because there's no guarentee specific ones appear in any given
   * data ensemble. These parameters just set to whatever the value are
   * in the first qualifying dataset.
   */
  getData: function (props) {
    // Legacy: NOOP
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    // This guards against re-rendering before calls to the data sever alter the
    // state
    // TODO: Consider making shallow comparisons. Deep ones are expensive.
    // If immutable data objects are used (or functionally equivalently,
    // new data objects each time), then shallow comparison works.
    return !(
      _.isEqual(nextProps.meta, this.props.meta) &&
      _.isEqual(nextProps.comparandMeta, this.props.comparandMeta));
  },

  getDualLongTermAveragesMetadata(timeOfYear) {
    // Return metadata for variable_id and, if present and different, for
    // comparand_id.
    const commonMetadataFromProps = _.pick(this.props,
      'ensemble_name', 'model_id', 'experiment', 'area'
    );
    const timeResolutionAndIndex = timeKeyToResolutionIndex(timeOfYear);

    let result = [{
      ...commonMetadataFromProps,
      ...timeResolutionAndIndex,
      variable_id: this.props.variable_id,
    }];

    if (this.props.comparand_id &&
        this.props.comparand_id !== this.props.variable_id) {
      result.push({
        ...commonMetadataFromProps,
        ...timeResolutionAndIndex,
        variable_id: this.props.comparand_id,
      });
    }
    return result;
  },

  dualLongTermAveragesDataToGraphSpec(data, context) {
    return dataToLongTermAverageGraph(data, context);
  },

  getDualTimeseriesMetadata() {
    const {
      model_id, experiment,
      variable_id, meta,
      comparand_id, comparandMeta,
    } = this.props;

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
  },

  dualTimeseriesDataToGraphSpec(meta, data) {
    return timeseriesToTimeseriesGraph(meta, ...data);
  },

  // TODO: Remove when no longer used
  /*
   * This function creates an object that is similar to the props DualDataController
   * receives from its parent, except that the "variable_id" and "meta" attributes
   * describe the secondary variable (comparand) instead of the primary variable.
   *
   * It is passed to mixin functions that normally work with metadata about the
   * primary variable stored from a DataController props object. It allows these methods
   * to operate on DualController's secondary variable as well.
   */
  mockUpComparandProps: function (props = this.props) {
    var mockup = _.omit(props, "meta", "comparandMeta", "variable_id", "comparand_id");
    mockup.meta = props.comparandMeta;
    mockup.variable_id = props.comparand_id;
    return mockup;
  },

  getDualAnnualCycleInstanceMetadata(instance) {
    // Find and return metadata matching model_id, experiment, variable_id
    // and instance (start_date, end_date, ensemble_name) for monthly, seasonal
    // and annual timescales.
    // Do the the same for comparand_id and comparandMeta.
    const {
      model_id, experiment,
      variable_id, meta,
      comparand_id, comparandMeta,
    } = this.props;

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
      monthlyComparandMetadata &&
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
  },

  dataToDualAnnualCycleGraphSpec(meta, data) {
    let graph = timeseriesToAnnualCycleGraph(meta, ...data);

    // function that assigns each data series to one of two groups based on
    // which variable it represents. Passed to assignColoursByGroup to assign
    // graph line colors.
    const sortByVariable = dataSeries => {
      const seriesName = dataSeries[0].toLowerCase();
      if (seriesName.search(this.props.variable_id) !== -1) {
        return 0;
      } else if (seriesName.search(this.props.comparand_id) !== -1) {
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
  },

  render: function () {
    const graphProps = _.pick(this.props,
      'model_id', 'variable_id', 'experiment', 'meta', 'area'
    );

    return (
      <div>
        <h3>
          {`${this.props.model_id} ${this.props.experiment}: ${this.props.variable_id} vs ${this.props.comparand_id}`}
        </h3>

        {
          multiYearMeanSelected(this.props) ? (

            <Tabs>
              <Tab eventKey={1} title='Annual Cycle'>
                <AnnualCycleGraph
                  {...graphProps}
                  getInstanceMetadata={this.getDualAnnualCycleInstanceMetadata}
                  dataToGraphSpec={this.dataToDualAnnualCycleGraphSpec}
                />
              </Tab>
              <Tab eventKey={2} title='Long Term Averages'>
                <LongTermAveragesGraph
                  {...graphProps}
                  getMetadata={this.getDualLongTermAveragesMetadata}
                  dataToGraphSpec={this.dualLongTermAveragesDataToGraphSpec}
                />
              </Tab>
            </Tabs>

          ) : (

            <Tabs>
              <Tab eventKey={1} title='Time Series'>
                <TimeSeriesGraph
                  {...graphProps}
                  getMetadata={this.getDualTimeseriesMetadata}
                  dataToGraphSpec={this.dualTimeseriesDataToGraphSpec}
                />
              </Tab>
            </Tabs>

          )
        }
      </div>
    );
  },
});

export default DualDataController;

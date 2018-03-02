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


import DataControllerMixin from '../DataControllerMixin';

import styles from './DualDataController.css';
import { multiYearMeanSelected } from '../graphs/graph-helpers';
import DualAnnualCycleGraph from '../graphs/DualAnnualCycleGraph';
import DualLongTermAveragesGraph from '../graphs/DualLongTermAveragesGraph';
import DualTimeSeriesGraph from '../graphs/DualTimeSeriesGraph';
import DualVariableResponseGraph from '../graphs/DualVariableResponseGraph';

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
  getData: function (props) {/* Legacy: NOOP*/},

  shouldComponentUpdate: function (nextProps, nextState) {
    // This guards against re-rendering before calls to the data sever alter the
    // state
    // TODO: Consider making shallow comparisons. Deep ones are expensive.
    // If immutable data objects are used (or functionally equivalently,
    // new data objects each time), then shallow comparison works.
    return !(
      _.isEqual(nextProps.meta, this.props.meta) &&
      _.isEqual(nextProps.comparandMeta, this.props.comparandMeta) &&
      _.isEqual(nextProps.area, this.props.area));
  },

  render: function () {
    return (
      <div>
        <h3>
          {`${this.props.model_id} ${this.props.experiment}: ${this.props.variable_id} vs ${this.props.comparand_id}`}
        </h3>

        {
          multiYearMeanSelected(this.props) ? (

            <Tabs>
              <Tab eventKey={1} title='Annual Cycle'>
                <DualAnnualCycleGraph {...this.props}/>
              </Tab>
              <Tab eventKey={2} title='Long Term Averages'>
                <DualLongTermAveragesGraph {...this.props}/>
              </Tab>
              <Tab eventKey={3} title='Variable Response'>
                <DualVariableResponseGraph {...this.props}/>
              </Tab>
            </Tabs>

          ) : (

            <Tabs>
              <Tab eventKey={1} title='Time Series'>
                <DualTimeSeriesGraph {...this.props}/>
              </Tab>
              <Tab eventKey={2} title='Variable Response'>
                <DualVariableResponseGraph {...this.props}/>
              </Tab>
            </Tabs>

          )
        }
      </div>
    );
  },
});

export default DualDataController;

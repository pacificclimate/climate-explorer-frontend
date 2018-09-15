/*********************************************************************
 * DualDataController.js - controller component for numerical display
 * of two variables at once, supporting comparison between them.
 *
 * Receives a model, experiment, and two variables from its parent,
 * [Dual|Precip]AppController. Provides widgets for users to select a specific
 * slice of the data (timespan or run). Queries the API to fetch data on
 * both variables for the DataGraph viewers it manages, Annual Cycle Graph,
 * Long Term Average Graph, and Timeseries Graph, to show comparisons of
 * the two variables.
 *
 * If a user selects two variables that come from multi year mean datasets,
 * an Annual Graph and a Long Term Average Graph will be displayed. If a
 * user selects two variables that are not multi year means, the less
 * structured Timeseries Graph will be displayed.
 * 
 * In either case, a Variable Response scatterplot is displayed, with the
 * secondary variable along the x axis (explanatory variable) and the 
 * primary variable along the y axis (response variable).
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
 * 
 * Children: DualAnnualCycleGraph, DualLongTermAveragesGraph
 *           DualVariableResponseGraph, DualTimeSeriesGraph
 *********************************************************************/

import PropTypes from 'prop-types';

import React from 'react';
import createReactClass from 'create-react-class';
import { Panel, Tab, Tabs, Row, Col } from 'react-bootstrap';
import _ from 'underscore';


import DataControllerMixin from '../../DataControllerMixin';

import { multiYearMeanSelected } from '../../graphs/graph-helpers';
import DualAnnualCycleGraph from '../../graphs/DualAnnualCycleGraph';
import DualLongTermAveragesGraph from '../../graphs/DualLongTermAveragesGraph';
import DualTimeSeriesGraph from '../../graphs/DualTimeSeriesGraph';
import DualVariableResponseGraph from '../../graphs/DualVariableResponseGraph';
import {
  singleLtaTabLabel, timeSeriesTabLabel,
  variableResponseTabLabel, dualAnnualCycleTabLabel, graphsPanelLabel,
} from '../../guidance-content/info/InformationItems';

import styles from '../DataController.css';
import { DualMEVSummary } from '../../MEVSummary/MEVSummary';


export default createReactClass({
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
        <Panel>
          <Panel.Heading>
            <Panel.Title>
              <Row>
                <Col lg={4}>
                  {graphsPanelLabel}
                </Col>
                <Col lg={8}>
                  <DualMEVSummary
                    className={styles.mevSummary} {...this.props}
                  />
                </Col>
              </Row>
            </Panel.Title>
          </Panel.Heading>
          <Panel.Body className={styles.data_panel}>
            {
              multiYearMeanSelected(this.props) ? (

                <Tabs id='Graphs'>
                  <Tab eventKey={1} title={dualAnnualCycleTabLabel}>
                    <DualAnnualCycleGraph {...this.props}/>
                  </Tab>
                  <Tab eventKey={2} title={singleLtaTabLabel}>
                    <DualLongTermAveragesGraph {...this.props}/>
                  </Tab>
                  <Tab eventKey={3} title={variableResponseTabLabel}>
                    <DualVariableResponseGraph {...this.props}/>
                  </Tab>
                </Tabs>

              ) : (

                <Tabs id='Graphs'>
                  <Tab eventKey={1} title={timeSeriesTabLabel}>
                    <DualTimeSeriesGraph {...this.props}/>
                  </Tab>
                  <Tab eventKey={2} title={variableResponseTabLabel}>
                    <DualVariableResponseGraph {...this.props}/>
                  </Tab>
                </Tabs>

              )
            }
          </Panel.Body>
        </Panel>
      </div>
    );
  },
});

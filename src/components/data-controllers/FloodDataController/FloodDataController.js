/*******************************************************************
 * FloodDataController.js - controller for numerical visualization of
 * flood frequency data.
 * The flood frequency data itself is very simple - there is only one
 * "model" (an ensemble mean) and all data is annual.
 * So it doesn't display a time slice graph or a context graph - these
 * are used to compare models. It also doesn't display a timeseries
 * graph or anomaly annual cycle graph - these show monthly and
 * seasonal changes. In fact, there is only one graph, a long term 
 * average graph. This graph displays both ensemble means and any
 * available ensemble percentiles.
 * 
 * Receives a model, an experiment, and a variable from its parent,
 * FloodAppController. Manages viewer components that display data as
 * graphs or tables. 
 *
 * Child component:
 *  - a SingleLongTermAverageGraph showing the mean of each climatology
 *    period as a seperate data point.
 *
 * A Data Table viewer component showing statistical information for each
 * climatology period or timeseries is also generated. 
 *******************************************************************/

import PropTypes from 'prop-types';

import React from 'react';
import { Row, Col, Panel } from 'react-bootstrap';
import _ from 'lodash';

import SingleTimeSeriesGraph from '../../graphs/SingleTimeSeriesGraph';
import PercentileLongTermAveragesGraph from '../../graphs/PercentileLongTermAveragesGraph';
import {
    percentileLtaTabLabel, graphsPanelLabel, timeSeriesTabLabel,
    } from '../../guidance-content/info/InformationItems';

import styles from '../DataController.module.css';
import { MEVSummary } from '../../data-presentation/MEVSummary';
import FlowArrow from '../../data-presentation/FlowArrow';
import GraphTabs from '../GraphTabs';

export default class FloodDataController extends React.Component {
  static propTypes = {
    model_id: PropTypes.string,
    variable_id: PropTypes.string,
    experiment: PropTypes.string,
    area: PropTypes.string,
    meta: PropTypes.array,
    percentileMeta: PropTypes.array,
    ensemble_name: PropTypes.string,  // TODO: Why is this declared? Remove?
  };

  // TODO: Is this necessary?
  shouldComponentUpdate(nextProps, nextState) {
    // This guards against re-rendering before calls to the data sever alter the
    // state
    // TODO: Consider making shallow comparisons. Deep ones are expensive.
    // If immutable data objects are used (or functionally equivalently,
    // new data objects each time), then shallow comparison works.
    return !(
      _.isEqual(nextProps.meta, this.props.meta) &&
      _.isEqual(nextProps.area, this.props.area)
     );
  }

  // Spec for generating tabs containing various graphs.
  // Property names indicate whether the dataset is a multi-year mean or not.
  // TODO: Pull this out into new component SingleVariableGraphs
  static graphTabsSpecs = {
    mym: [
      { title: percentileLtaTabLabel, graph: PercentileLongTermAveragesGraph },
    ],
    notMym: [
      { title: timeSeriesTabLabel, graph: SingleTimeSeriesGraph },
    ],
  };

  render() {
    // TODO: Improve returned item
    if (!_.allDefined(this.props, 'model_id', 'experiment', 'variable_id')) {
      return 'Readying...';
    }

    return (
      // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/246
      <div>
        <Panel>
          <Panel.Heading>
            <Panel.Title>
              <Row>
                <Col lg={4}>
                  {graphsPanelLabel}
                </Col>
                <Col lg={8}>
                  <MEVSummary
                    className={styles.mevSummary} {...this.props}
                  />
                </Col>
              </Row>
            </Panel.Title>
          </Panel.Heading>
          <Panel.Body className={styles.data_panel}>
            <GraphTabs
              {...this.props}
              specs={FloodDataController.graphTabsSpecs}
            />
          </Panel.Body>
        </Panel>

      </div>
    );
  }
}

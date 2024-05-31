/*******************************************************************
 * SingleDataController.js - controller component for in-depth numerical
 * visualization of a single variable
 *
 * Receives a model, an experiment, and a variable from its parent,
 * SingleAppController. Manages viewer components that display data as
 * graphs or tables.
 *
 * Child components vary by whether the selected dataset is a multi year mean
 * climatology. If so:
 *  - a SingleAnnualCycleGraph displaying data with monthly, seasonal, and annual
 *    resolution (as available)
 *
 *  - a SingleLongTermAverageGraph showing the mean of each climatology
 *    period as a seperate data point.
 *
 *  - a SingleContextGraph similar to the Long Term Average graph, but with
 *    a separate line for each model and simplified presentation.
 *
 *  - an AnomalyAnnualCycleGraph displaying future data as delta from a
 *    "baseline" climatology (usually 1981 - 2010)
 *
 *  - a SingleTimeSliceGraph, which compares all available models
 *    at a single timestamp.
 *
 * If the selected dataset is not a multi year mean:
 *  - a freeform SingleTimeSeriesGraph showing each time point available.
 *
 * A Data Table viewer component showing statistical information for each
 * climatology period or timeseries is also generated.
 *******************************************************************/

import PropTypes from "prop-types";

import React from "react";
import { Row, Col, Panel } from "react-bootstrap";
import _ from "lodash";

import SingleAnnualCycleGraph from "../../graphs/SingleAnnualCycleGraph";
import SingleLongTermAveragesGraph from "../../graphs/SingleLongTermAveragesGraph";
import SingleContextGraph from "../../graphs/SingleContextGraph";
import SingleTimeSeriesGraph from "../../graphs/SingleTimeSeriesGraph";
import AnomalyAnnualCycleGraph from "../../graphs/AnomalyAnnualCycleGraph";
import {
  singleAnnualCycleTabLabel,
  changeFromBaselineTabLabel,
  singleLtaTabLabel,
  modelContextTabLabel,
  timeSeriesTabLabel,
  graphsPanelLabel,
} from "../../guidance-content/info/InformationItems";

import styles from "../DataController.module.css";
import { MEVSummary } from "../../data-presentation/MEVSummary";
import FlowArrow from "../../data-presentation/FlowArrow";
import GraphTabs from "../GraphTabs";
import StatisticalSummaryTable from "../../StatisticalSummaryTable";

export default class SingleDataController extends React.Component {
  static propTypes = {
    model_id: PropTypes.string,
    variable_id: PropTypes.string,
    experiment: PropTypes.string,
    area: PropTypes.string,
    meta: PropTypes.array,
    contextMeta: PropTypes.array,
    ensemble_name: PropTypes.string, // TODO: Why is this declared? Remove?
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
      { title: singleAnnualCycleTabLabel, graph: SingleAnnualCycleGraph },
      { title: singleLtaTabLabel, graph: SingleLongTermAveragesGraph },
      { title: modelContextTabLabel, graph: SingleContextGraph },
      { title: changeFromBaselineTabLabel, graph: AnomalyAnnualCycleGraph },
    ],
    notMym: [{ title: timeSeriesTabLabel, graph: SingleTimeSeriesGraph }],
  };

  render() {
    // TODO: Improve returned item
    if (!_.allDefined(this.props, "model_id", "experiment", "variable_id")) {
      return "Readying...";
    }

    return (
      // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/246
      <div>
        <Panel>
          <Panel.Heading>
            <Panel.Title>
              <Row>
                <Col lg={4}>{graphsPanelLabel}</Col>
                <Col lg={8}>
                  <MEVSummary className={styles.mevSummary} {...this.props} />
                </Col>
              </Row>
            </Panel.Title>
          </Panel.Heading>
          <Panel.Body className={styles.data_panel}>
            <GraphTabs
              {...this.props}
              specs={SingleDataController.graphTabsSpecs}
            />
          </Panel.Body>
        </Panel>

        <FlowArrow>filtered datasets</FlowArrow>

        <StatisticalSummaryTable {...this.props} />
      </div>
    );
  }
}

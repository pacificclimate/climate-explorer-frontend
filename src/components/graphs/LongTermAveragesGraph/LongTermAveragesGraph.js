// This component renders a complete long-term average graph, including a
// selector for the averaged period of interest (e.g., January, Fall, Year).
// A long-term average graph presents spatially averaged values of
// climatological average data for the selected model, variable,
// experiment, and the locally-selected period of interest,
// for each available climatological averaging period (forming the time
// axis, which typically extends from 1950 to 2100).
//
// The component is generalized by two function props, `getMetadata`
// and `dataToGraphSpec`, which respectively return metadata describing the
// the datasets to display, and return a graph spec for the graph proper.

import PropTypes from "prop-types";
import React from "react";
import { Row, Col, ControlLabel } from "react-bootstrap";

import _ from "lodash";

import { TimeOfYearSelector } from "pcic-react-components";
import DataGraph from "../DataGraph/DataGraph";
import ExportButtons from "../ExportButtons";

import {
  loadingDataGraphSpec,
  noDataMessageGraphSpec,
  errorMessage,
} from "../graph-helpers";
import {
  timeKeyToResolutionIndex,
  validateLongTermAverageData,
  timeResolutions,
} from "../../../core/util";
import { getData } from "../../../data-services/ce-backend";
import { exportDataToWorksheet } from "../../../core/export";
import { timeOfYearSelectorLabel } from "../../guidance-content/info/InformationItems";
import styles from "./LongTermAveragesGraph.module.css";

export default class LongTermAveragesGraph extends React.Component {
  static propTypes = {
    model_id: PropTypes.string,
    variable_id: PropTypes.string,
    experiment: PropTypes.string,
    meta: PropTypes.array,
    area: PropTypes.string,
    getMetadata: PropTypes.func,
    // `getMetadata` returns the metadata describing the datasets to
    // be displayed in this component.
    // A different function is passed by different clients to specialize
    // this general component to particular cases (single vs. dual controller).
    dataToGraphSpec: PropTypes.func,
    // `dataToGraphSpec` converts data (monthly, seasonal, annual cycle data)
    // to a graph spec.
    // A different function is passed by different clients to specialize
    // this general component to particular cases (single vs. dual controller).
  };

  // Lifecycle hooks
  // Follows React 16+ lifecycle API and recommendations.
  // See https://reactjs.org/blog/2018/03/29/react-v-16-3.html
  // See https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html
  // See https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html

  constructor(props) {
    super(props);

    // See ../README for an explanation of the content and usage
    // of state values. This is important for understanding how this
    // component works.

    this.state = {
      prevMeta: null,
      prevArea: null,
      prevTimeOfYear: undefined,
      timeOfYear: undefined,
      data: null,
      dataError: null,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.meta !== state.prevMeta || props.area !== state.prevArea) {
      return {
        prevMeta: props.meta,
        prevArea: props.area,
        fetchingData: false, // not quite yet
        data: null, // Signal that data fetch is required
        dataError: null,
      };
    }

    // State change (timeOfYear). Signal need for data fetch.
    if (state.prevTimeOfYear !== state.timeOfYear) {
      return {
        prevTimeOfYear: state.timeOfYear,
        fetchingData: false, // not quite yet
        data: null, // Signal that data fetch is required
        dataError: null,
      };
    }

    // No state update necessary.
    return null;
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.state.fetchingData && this.state.data === null) {
      this.fetchData();
    }
  }

  // Data fetching

  getAndValidateData(metadata) {
    return getData(metadata)
      .then(validateLongTermAverageData)
      .then((response) => response.data);
  }

  getMetadatas = () =>
    // This fn is called multiple times, so memoize it if inefficient
    this.props
      .getMetadata(this.state.timeOfYear && this.state.timeOfYear.value)
      .filter((metadata) => !!metadata);

  fetchData() {
    this.setState({ fetchingData: true });
    Promise.all(
      this.getMetadatas().map((metadata) => this.getAndValidateData(metadata)),
    )
      .then((data) => {
        this.setState({
          fetchingData: false,
          data,
          dataError: null,
        });
      })
      .catch((dataError) => {
        this.setState({
          // Do we have to set data non-null here to prevent infinite update loop?
          fetchingData: false,
          dataError,
        });
      });
  }

  // User event handlers

  handleChangeTimeOfYear = (timeOfYear) => {
    this.setState({ timeOfYear });
  };

  handleChangeNewTOY = (newTOY) => {
    this.setState({ newTOY });
  };

  exportData(format) {
    exportDataToWorksheet(
      "climoseries",
      _.pick(this.props, "model_id", "variable_id", "experiment", "meta"),
      this.graphSpec(),
      format,
      timeKeyToResolutionIndex(this.state.timeOfYear.value),
    );
  }

  handleExportXlsx = this.exportData.bind(this, "xlsx");
  handleExportCsv = this.exportData.bind(this, "csv");

  // render helpers

  graphSpec() {
    // Return a graphSpec appropriate to the given state

    // An error occurred
    if (this.state.dataError) {
      return noDataMessageGraphSpec(errorMessage(this.state.dataError));
    }

    // Waiting for data
    if (this.state.fetchingData || this.state.data === null) {
      return loadingDataGraphSpec;
    }

    // We can haz data
    try {
      return this.props.dataToGraphSpec(this.state.data, this.getMetadatas());
    } catch (error) {
      // dataToGraphSpec may blow a raspberry if the data it is passed is
      // invalid. This won't happen due to mismatched timeOfYear and data,
      // because we don't allow that mismatch to occur.
      return noDataMessageGraphSpec(errorMessage(error));
    }
  }

  render() {
    return (
      <React.Fragment>
        <Row>
          <Col lg={6} md={6} sm={6}>
            <ControlLabel className={styles.selector_label}>
              {timeOfYearSelectorLabel}
            </ControlLabel>
            <TimeOfYearSelector
              value={this.state.timeOfYear}
              onChange={this.handleChangeTimeOfYear}
              {...timeResolutions(this.props.meta)}
              className={styles.selector}
            />
          </Col>
          <Col lg={6} md={6} sm={6}>
            <ExportButtons
              onExportXlsx={this.handleExportXlsx}
              onExportCsv={this.handleExportCsv}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <DataGraph {...this.graphSpec()} />
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

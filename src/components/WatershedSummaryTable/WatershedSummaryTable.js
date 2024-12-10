// Watershed Summary Table: Panel containing a Attribute Value table that
// shows physical information (elevation, area, etc) about the watershed the user
// has selected.

// TODO: Use HOC `withAsyncData` to manage fetching data

import PropTypes from "prop-types";
import React from "react";
import { Row, Col, Panel } from "react-bootstrap";

import _ from "lodash";

import AttributeValueTable from "../AttributeValueTable/AttributeValueTable";
import { watershedTableLabel } from "../guidance-content/info/InformationItems";

import { getWatershed } from "../../data-services/ce-backend";
import {
  parseWatershedTableData,
  validateWatershedData,
} from "../../core/util";
import { errorMessage } from "../graphs/graph-helpers";

import styles from "./WatershedSummaryTable.module.css";

// TODO: Use `withAsyncData` to factor out common data-fetching code here
export default class WatershedSummaryTable extends React.Component {
  static propTypes = {
    ensemble_name: PropTypes.string,
    area: PropTypes.string,
  };

  // Lifecycle hooks
  // Follows React 16+ lifecycle API and recommendations.
  // See https://reactjs.org/blog/2018/03/29/react-v-16-3.html
  // See https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html
  // See https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html

  constructor(props) {
    super(props);

    // See src/components/graphs/README for an explanation of the content and
    // usage of state values. This is important for understanding how this
    // component works.

    this.state = {
      prevArea: null,
      data: null,
      dataError: null,
      // Signal that data fetch is required
      isLoading: false,
      isSuccess: false,
      isError: false,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.area !== state.prevArea) {
      return {
        prevArea: props.area,
        data: null,
        dataError: null,
        // Signal that data fetch is required
        isLoading: false,
        isSuccess: false,
        isError: false,
      };
    }

    // No state update necessary.
    return null;
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.state.isLoading && !this.state.isSuccess && !this.state.isError) {
      this.fetchData();
    }
  }

  // Data fetching

  getAndValidateWatershed(parameters) {
    return getWatershed(parameters)
      .then(validateWatershedData)
      .then((response) => response.data);
  }

  fetchData() {
    if (!this.props.area) {
      // Don't fetch data when user hasn't selected a watershed
      return;
    }
    this.setState({ isLoading: true });
    const metadata = {
      ..._.pick(this.props, "ensemble_name", "area"),
    };
    this.getAndValidateWatershed(metadata)
      .then((data) => {
        this.setState({
          isLoading: false,
          isSuccess: true,
          isError: false,
          data: parseWatershedTableData(data, this.props.area),
          dataError: null,
        });
      })
      .catch((dataError) => {
        this.setState({
          isLoading: false,
          isSuccess: false,
          isError: true,
          data: null,
          dataError,
        });
      });
  }

  // render helpers

  watershedTableOptions() {
    // Return a data table options object appropriate to the current state.

    // An error occurred
    if (this.state.dataError) {
      return { noDataText: errorMessage(this.state.dataError) };
    }

    // Waiting for data
    if (!this.state.data) {
      return {
        noDataText:
          "Select an outlet point on the map with the circle marker tool to see watershed information",
      };
    }

    // We can haz data
    return { noDataText: "We have data and this message should not show" };
  }

  render() {
    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title>
            <Row>
              <Col lg={4}>{watershedTableLabel}</Col>
            </Row>
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body className={styles.data_panel}>
          <AttributeValueTable
            data={this.state.data || []}
            options={this.watershedTableOptions()}
          />
        </Panel.Body>
      </Panel>
    );
  }
}

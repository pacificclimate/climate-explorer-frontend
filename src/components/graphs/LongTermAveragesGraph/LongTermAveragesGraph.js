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

import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col } from 'react-bootstrap';

import _ from 'underscore';

import TimeOfYearSelector from '../../Selector/TimeOfYearSelector';
import DataGraph from '../DataGraph/DataGraph';
import ExportButtons from '../ExportButtons';

import {
  loadingDataGraphSpec,
  noDataMessageGraphSpec,
  errorMessage,
} from '../graph-helpers';
import {
  timeKeyToResolutionIndex,
  validateLongTermAverageData,
  timeResolutions,
  defaultTimeOfYear,
} from '../../../core/util';
import { getData } from '../../../data-services/ce-backend';
import { exportDataToWorksheet } from '../../../core/export';

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

    this.state = {
      prevMeta: null,
      prevArea: null,
      prevTimeOfYear: null,
      timeOfYear: null,
      data: null,
      dataError: null,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (
      props.meta !== state.prevMeta ||
      props.area !== state.prevArea
    ) {
      return {
        prevMeta: props.meta,
        prevArea: props.area,
        // Avoid triggering an unnecessary second second data fetch due to
        // change in timeOfYear.
        prevTimeOfYear: timeOfYear,
        timeOfYear,
        fetchingData: false,  // not quite yet
        data: null,  // Signal that data fetch is required
        dataError: null,
      };
    }

    // State change (timeOfYear). Signal need for data fetch.
    if (state.prevTimeOfYear !== state.timeOfYear) {
      return {
        prevTimeOfYear: state.timeOfYear,
        fetchingData: false,  // not quite yet
        data: null,  // Signal that data fetch is required due to state change
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
    return (
      getData(metadata)
      .then(validateLongTermAverageData)
      .then(response => response.data)
    );
  }

  getMetadatas = () =>
    // This fn is called multiple times, so memoize it if inefficient
    this.props.getMetadata(this.state.timeOfYear)
    .filter(metadata => !!metadata)

  fetchData() {
    this.setState({ fetchingData: true });
    Promise.all(
      this.getMetadatas()
      .map(metadata => this.getAndValidateData(metadata))
    )
    .then(data => {
      this.setState({
        fetchingData: false,
        data,
        dataError: null,
      });
    }).catch(dataError => {
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

  exportData(format) {
    const { timescale: timeres, timeidx } =
      timeKeyToResolutionIndex(this.state.timeOfYear);
    exportDataToWorksheet(
      'climoseries',
      _.pick(this.props, 'model_id', 'variable_id', 'experiment', 'meta'),
      this.graphSpec(),
      format,
      { timeres, timeidx }
    );
  }

  handleExportXlsx = this.exportData.bind(this, 'xlsx');
  handleExportCsv = this.exportData.bind(this, 'csv');
  
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
            <TimeOfYearSelector
              value={this.state.timeOfYear}
              onChange={this.handleChangeTimeOfYear}
              {...timeResolutions(this.props.meta)}
              inlineLabel
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
            <DataGraph {...this.graphSpec()}/>
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

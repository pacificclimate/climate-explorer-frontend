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
  displayError,
  noDataMessageGraphSpec,
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
  // Follows React 16+ new lifecycle API and recommendations.
  // See https://reactjs.org/blog/2018/03/29/react-v-16-3.html
  // See https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html
  // See https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html

  // TODO: Don't store graphSpec on state, store data and derive graphSpec?

  constructor(props) {
    super(props);

    this.state = {
      // prevMeta: null,
      // prevArea: null,
      timeOfYear: defaultTimeOfYear(timeResolutions(this.props.meta)),

      data: null,
      graphSpec: loadingDataGraphSpec,  // TODO: Remove from state
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (
      props.meta !== state.prevMeta ||
      props.area !== state.prevArea
    ) {
      return {
        timeOfYear: defaultTimeOfYear(timeResolutions(props.meta)),
        prevMeta: props.meta,
        prevArea: props.area,
        data: null,  // Signal that data fetch is required
        graphSpec: loadingDataGraphSpec,  // TODO: Remove from state
      };
    }

    // No state update necessary.
    return null;
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      // props changed => data invalid
      this.state.data === null ||
      // user selected new time of year
      this.state.timeOfYear !== prevState.timeOfYear
    ) {
      this.fetchData();
    }
  }

  componentWillUnmount() {
    if (this.dataRequest) {
      this.dataRequest.cancel();
    }
  }

  // Data fetching

  displayNoDataMessage = (message) => {
    //Removes all data from the graph and displays a message
    this.setState({
      graphSpec: noDataMessageGraphSpec(message),
    });
  };

  getAndValidateData(metadata) {
    return (
      getData(metadata)
      .then(validateLongTermAverageData)
      .then(response => response.data)
    );
  }

  fetchData() {
    const timeOfYearMetadatas =
      this.props.getMetadata(this.state.timeOfYear)
      .filter(metadata => !!metadata);
    const dataPromises = timeOfYearMetadatas.map(metadata =>
      this.getAndValidateData(metadata)
    );

    this.dataRequest = Promise.all(dataPromises).then(data => {
      this.setState({
        data,
        graphSpec: this.props.dataToGraphSpec(data, timeOfYearMetadatas), // TODO: Remove from state
      });
    }).catch(error => {
      displayError(error, this.displayNoDataMessage);
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
      this.state.graphSpec,
      format,
      { timeres, timeidx }
    );
  }

  handleExportXlsx = this.exportData.bind(this, 'xlsx');
  handleExportCsv = this.exportData.bind(this, 'csv');

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
            <DataGraph {...this.state.graphSpec}/>
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

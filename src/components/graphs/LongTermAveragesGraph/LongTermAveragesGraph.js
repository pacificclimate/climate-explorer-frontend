import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col } from 'react-bootstrap';

import _ from 'underscore';

import TimeOfYearSelector from '../../Selector/TimeOfYearSelector';
import DataGraph from '../DataGraph/DataGraph';
import ExportButtons from '../ExportButtons';

import {
  blankGraphSpec,
  displayError,
  noDataMessageGraphSpec,
  shouldLoadData,
} from '../graph-helpers';
import {
  timeKeyToResolutionIndex,
  timeKeyToTimeOfYear,
  validateLongTermAverageData,
} from '../../../core/util';
import { getData } from '../../../data-services/ce-backend';
import { exportDataToWorksheet } from '../../../core/export';

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

  constructor(props) {
    super(props);

    // const timeResolutions = _.pluck(props.meta, 'timescale');
    // const monthlyData = _.contains(timeResolutions, 'monthly');
    // const seasonalData = _.contains(timeResolutions, 'seasonal');
    // const yearlyData = _.contains(timeResolutions, 'yearly');
    //
    // //default to Annual, but use higher resolution if available.
    // let timeOfYear = 16; //Annual
    // if (monthlyData) {
    //   timeOfYear = 0; //January
    // } else if (seasonalData) {
    //   timeOfYear = 12; //Winter
    // }

    this.state = {
      // timeOfYear,
      graphSpec: blankGraphSpec,
      // monthlyData,
      // seasonalData,
      // yearlyData,
    };
  }

  handleChangeTimeOfYear = (timeOfYear) => {
    this.setState({ timeOfYear });
  };

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

  timeResolutions() {
    const timeResolutions = _.pluck(this.props.meta, 'timescale');
    const monthlyData = _.contains(timeResolutions, 'monthly');
    const seasonalData = _.contains(timeResolutions, 'seasonal');
    const yearlyData = _.contains(timeResolutions, 'yearly');

    return {
      monthlyData,
      seasonalData,
      yearlyData,
    };
  }

  defaultTimeOfYear({ monthlyData, seasonalData, yearlyData }) {
    if (monthlyData) {
      return 0;  // January
    }
    if (seasonalData) {
      return 12;  // Winter
    }
    if (yearlyData) {
      return 16;  // Annual
    }
    return undefined;
  }

  loadGraph() {
    // Fetch data for graph, then convert it to a graph spec and set state
    // accordingly.

    if (!shouldLoadData(this.props, this.displayNoDataMessage)) {
      return;
    }

    this.setState({
      timeOfYear: this.defaultTimeOfYear(this.timeResolutions()),
    });

    const timeOfYearMetadatas =
      this.props.getMetadata(this.state.timeOfYear)
        .filter(metadata => !!metadata);
    const dataPromises = timeOfYearMetadatas.map(metadata =>
      this.getAndValidateData(metadata)
    );

    Promise.all(dataPromises).then(data => {
      this.setState({
        graphSpec: this.props.dataToGraphSpec(data, timeOfYearMetadatas),
      });
    }).catch(error => {
      displayError(error, this.displayNoDataMessage);
    });
  }

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

  // Lifecycle hooks

  componentDidMount() {
    this.loadGraph();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.meta !== this.props.meta ||
      prevProps.area !== this.props.area ||
      prevState.timeOfYear !== this.state.timeOfYear
    ) {
      this.loadGraph();
    }
  }

  render() {
    const timeResolutions = this.timeResolutions();
    return (
      <React.Fragment>
        <Row>
          <Col lg={6} md={6} sm={6}>
            <TimeOfYearSelector
              value={this.state.timeOfYear}
              onChange={this.handleChangeTimeOfYear}
              hideMonths={!timeResolutions.monthlyData}
              hideSeasons={!timeResolutions.seasonalData}
              hideYear={!timeResolutions.yearlyData}
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

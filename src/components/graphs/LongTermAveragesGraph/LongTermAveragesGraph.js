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
  validateLongTermAverageData,
} from '../../../core/util';
import { getData } from '../../../data-services/ce-backend';
import { exportDataToWorksheet } from '../../../core/export';

// This component renders a graph, over actual time points (as opposed to the
// "average year" time points of an annual cycle graph), of spatially averaged
// values of long-term average data for the selected model, variable, and
// experiment.
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

    this.state = {
      timeOfYear: 0,
      graphSpec: blankGraphSpec,
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

  loadGraph() {
    // Fetch data for graph, then convert it to a graph spec and set state
    // accordingly.

    if (!shouldLoadData(this.props, this.displayNoDataMessage)) {
      return;
    }

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

  handleExportXslx = this.exportData.bind(this, 'xslx');
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
    return (
      <React.Fragment>
        <Row>
          <Col lg={4} lgPush={8} md={6} mdPush={6} sm={6} smPush={6}>
            <TimeOfYearSelector
              value={this.state.timeOfYear}
              onChange={this.handleChangeTimeOfYear}
            />
          </Col>
          <Col>
            <ExportButtons
              onExportXslx={this.handleExportXslx}
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

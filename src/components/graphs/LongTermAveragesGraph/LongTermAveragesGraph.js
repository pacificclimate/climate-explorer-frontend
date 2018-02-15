import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col } from 'react-bootstrap';

import _ from 'underscore';

import TimeOfYearSelector from '../../Selector/TimeOfYearSelector';
import DataGraph from '../../DataGraph/DataGraph';
import ExportButtons from '../ExportButtons';

import {
  blankGraphSpec,
  displayError,
  noDataMessageGraphSpec,
} from '../../../core/data-controller-helpers';
import {
  timeKeyToResolutionIndex,
  validateLongTermAverageData,
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
    dataToGraphSpec: PropTypes.func,
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
    // Fetch data for LTA graph, then convert it to a graph spec and set state
    // accordingly.
    this.displayNoDataMessage('Loading Data');

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
    console.log('exportData', _.pick(this.props, 'model_id', 'variable_id', 'experiment', 'meta'))
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

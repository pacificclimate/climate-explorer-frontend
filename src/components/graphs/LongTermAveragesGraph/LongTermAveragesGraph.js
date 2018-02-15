import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col } from 'react-bootstrap';

import _ from 'underscore';

import TimeOfYearSelector from '../../Selector/TimeOfYearSelector';
import DataGraph from '../../DataGraph/DataGraph';
import ExportButtons from '../ExportButtons';

import { displayError } from '../../../core/data-controller-helpers';
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
      graphSpec: undefined,
    };
  }

  handleChangeTimeOfYear = (timeOfYear) => {
    this.setState({ timeOfYear });
  };

  //Removes all data from the graph and displays a message
  // TODO: set on either loading flag or empty data
  // TODO: Extract: common to all graphs
  setGraphNoDataMessage = (message) => {
    this.setState({
      graphSpec: {
        data: {
          columns: [],
          empty: {
            label: {
              text: message,
            },
          },
        },
        axis: {},
      },
    });
  };

  getAndValidateData(metadata) {
    return (
      getData(metadata)
        .then(validateLongTermAverageData)
        .then(response => response.data)
    );
  }

  loadLongTermAveragesGraph() {
    // Fetch data for LTA graph, then convert it to a graph spec and set state
    // accordingly.
    this.setGraphNoDataMessage('Loading Data');

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
      displayError(error, this.setGraphNoDataMessage);
    });
  }

  // TODO: Extract to core/chart module, as it is common to all graphs.
  blankGraph = {
    data: {
      columns: [],
    },
    axis: {},
  };

  exportLongTermAverage(format) {
    console.log('exportLongTermAverage', _.pick(this.props, 'model_id', 'variable_id', 'experiment', 'meta'))
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

  handleExportXslx = this.exportLongTermAverage.bind(this, 'xslx');
  handleExportCsv = this.exportLongTermAverage.bind(this, 'csv');

  // Lifecycle hooks

  componentDidMount() {
    this.loadLongTermAveragesGraph();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.meta !== this.props.meta ||
      prevProps.area !== this.props.area ||
      prevState.timeOfYear !== this.state.timeOfYear
    ) {
      this.loadLongTermAveragesGraph();
    }
  }

  render() {
    const graphSpec = this.state.graphSpec || this.blankGraph;

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
            <DataGraph
              data={graphSpec.data}
              axis={graphSpec.axis}
              tooltip={graphSpec.tooltip}
            />
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

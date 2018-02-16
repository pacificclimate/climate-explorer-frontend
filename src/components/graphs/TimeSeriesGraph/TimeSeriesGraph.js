import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col, ControlLabel } from 'react-bootstrap';

import DataGraph from '../../DataGraph/DataGraph';
import styles from './TimeSeriesGraph.css';
import {
  validateAnnualCycleData,
  validateUnstructuredTimeseriesData,
} from '../../../core/util';
import { getTimeseries } from '../../../data-services/ce-backend';
import {
  multiYearMeanSelected,
} from '../../../core/data-controller-helpers';
import {
  blankGraphSpec,
  displayError,
  noDataMessageGraphSpec,
} from '../graph-helpers';


export default class TimeSeriesGraph extends React.Component {
  static propTypes = {
    meta: PropTypes.array,
    area: PropTypes.string,
    getMetadata: PropTypes.func,
    dataToGraphSpec: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      graphSpec: blankGraphSpec,
    };
  }

  displayNoDataMessage = (message) => {
    //Removes all data from the graph and displays a message
    this.setState({
      graphSpec: noDataMessageGraphSpec(message),
    });
  };

  getAndValidateTimeseries(metadata, area) {
    const validate = multiYearMeanSelected(this.props) ?
      validateAnnualCycleData :
      validateUnstructuredTimeseriesData;
    return (
      getTimeseries(metadata, area)
        .then(validate)
        .then(response => response.data)
    );
  }

  loadGraph(props) {
    this.displayNoDataMessage('Loading Data');

    const metadatas = this.props.getMetadata().filter(metadata => !!metadata);
    const timeseriesPromises = metadatas.map(metadata =>
      this.getAndValidateTimeseries(metadata, props.area)
    );

    Promise.all(timeseriesPromises).then(data => {
      this.setState({
        graphSpec: this.props.dataToGraphSpec(metadatas, data),
      });
    }).catch(error => {
      displayError(error, this.displayNoDataMessage);
    });
  }

  // Lifecycle hooks

  componentDidMount() {
    this.loadGraph(this.props);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.meta !== this.props.meta ||
      prevProps.area !== this.props.area ||
      prevState.timeOfYear !== this.state.timeOfYear
    ) {
      this.loadGraph(this.props);
    }
  }

  render() {
    return (
      <Row>
        <Col>
          <DataGraph {...this.state.graphSpec}/>
          <ControlLabel className={styles.graphlabel}>
            Highlight a time span on lower graph to see more detail
          </ControlLabel>
        </Col>
      </Row>
    );
  }
}

/**************************************************************************
 * VariableResponseGraph.js - scatterplot showing relationship between two 
 *                            variables
 **************************************************************************/

import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col } from 'react-bootstrap';

import DataGraph from '../DataGraph/DataGraph';
import {
  validateAnnualCycleData,
  validateUnstructuredTimeseriesData,
} from '../../../core/util';
import { getTimeseries } from '../../../data-services/ce-backend';
import {
  blankGraphSpec,
  displayError, multiYearMeanSelected,
  noDataMessageGraphSpec, shouldLoadData,
} from '../graph-helpers';


// This component renders a graph of the spatially averaged values of a
// non-temporally averaged dataset over time.
//
// The component is generalized by two function props, `getMetadata`
// and `dataToGraphSpec`, which respectively return metadata describing the
// the datasets to display, and return a graph spec for the graph proper.

export default class VariableResponseGraph extends React.Component {
  static propTypes = {
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

  loadGraph() {
    // Fetch data for graph, then convert it to a graph spec and set state
    // accordingly.

    if (!shouldLoadData(this.props, this.displayNoDataMessage)) {
      return;
    }
    if (this.props.comparand_id === this.props.variable_id) {
      this.displayNoDataMessage("Variable response graph requires two selected variables");
      return;
    }

    const metadatas = this.props.getMetadata().filter(metadata => !!metadata);
    const timeseriesPromises = metadatas.map(metadata =>
      this.getAndValidateTimeseries(metadata, this.props.area)
    );

    Promise.all(timeseriesPromises).then(data => {
      this.setState({
        graphSpec: this.props.dataToGraphSpec(metadatas, data, this.props.variable_id, this.props.comparand_id),
      });
    }).catch(error => {
      displayError(error, this.displayNoDataMessage);
    });
  }

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
      <Row>
        <Col>
          <DataGraph {...this.state.graphSpec}/>
        </Col>
      </Row>
    );
  }
}

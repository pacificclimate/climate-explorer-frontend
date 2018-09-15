import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col } from 'react-bootstrap';

import _ from 'underscore';

import DataSpecSelector from '../../DataSpecSelector/DataSpecSelector';
import DataGraph from '../DataGraph/DataGraph';
import ExportButtons from '../ExportButtons';
import { exportDataToWorksheet } from '../../../core/export';
import { getTimeseries } from '../../../data-services/ce-backend';
import {
  validateAnnualCycleData,
  validateUnstructuredTimeseriesData,
} from '../../../core/util';
import {
  displayError,
  noDataMessageGraphSpec,
  blankGraphSpec,
  multiYearMeanSelected,
  shouldLoadData,
} from '../graph-helpers';

// This component renders an annual cycle graph, including a selector
// for the specific set of data to display and export-data buttons. An annual
// cycle graph presents spatially averaged values of a multi-year mean dataset
// as points over a nominal year (representing the "average" year).
//
// The component is generalized by two function props, `getMetadata`
// and `dataToGraphSpec`, which respectively return metadata describing the
// the datasets to display, and return a graph spec for the graph proper.

export default class AnnualCycleGraph extends React.Component {
  // TODO: model_id, variable_id, and experiment are used only to set the
  // initial data specification. Could instead make `initialDataSpec` a prop, which
  // the client computes according to their own recipe. Not sure whether
  // this is a gain or not, since the same computation (`initialDataSpec`)
  // would be done in each client.
  static propTypes = {
    meta: PropTypes.array,
    model_id: PropTypes.string,
    variable_id: PropTypes.string,
    experiment: PropTypes.string,
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

    const { start_date, end_date, ensemble_member } =
      this.initialDataSpec(this.props);
    this.state = {
      dataSpec: { start_date, end_date, ensemble_member },
      graphSpec: blankGraphSpec,
    };
  }

  initialDataSpec({ meta, model_id, variable_id, experiment }) {
    //selects a starting dataspec, preferring one with the highest-resolution data available.
    return (
      _.findWhere(meta,
          { model_id, variable_id, experiment, timescale: 'monthly' }) ||
      _.findWhere(meta,
          { model_id, variable_id, experiment, timescale: 'seasonal' }) ||
      _.findWhere(meta,
          { model_id, variable_id, experiment, timescale: 'yearly' })
    );
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
    // Fetch monthly, seasonal, and yearly resolution annual cycle data,
    // then convert it to a graph spec and set state accordingly.

    if (!shouldLoadData(this.props, this.displayNoDataMessage)) {
      return;
    }

    const dataSpecMetadata =
      this.props.getMetadata(this.state.dataSpec)
        .filter(metadata => !!metadata);
    const timeseriesPromises =
      dataSpecMetadata.map(metadata =>
        this.getAndValidateTimeseries(metadata, this.props.area)
      );

    Promise.all(timeseriesPromises).then(data => {
      this.setState({
        graphSpec: this.props.dataToGraphSpec(dataSpecMetadata, data),
      });
    }).catch(error => {
      displayError(error, this.displayNoDataMessage);
    });
  }

  // TODO: Refactor to eliminate encoding of dataSpec
  handleChangeDataSpec = (dataSpec) => {
    this.setState({ dataSpec: JSON.parse(dataSpec) });
  };

  exportData(format) {
    exportDataToWorksheet(
      'timeseries',
      _.pick(this.props, 'model_id', 'variable_id', 'experiment', 'meta'),
      this.state.graphSpec,
      format,
      this.state.dataSpec
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
      !_.isEqual(prevState.dataSpec, this.state.dataSpec)
    ) {
      this.loadGraph();
    }
  }

  render() {
    return (
      <React.Fragment>
        <Row>
          <Col lg={6} md={6} sm={6}>
            <DataSpecSelector
              meta={this.props.meta}
              // TODO: Refactor to eliminate encoding of dataSpec.
              value={JSON.stringify(this.state.dataSpec)}
              onChange={this.handleChangeDataSpec}
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

import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col, ControlLabel } from 'react-bootstrap';

import _ from 'lodash';

import { DataspecSelector } from 'pcic-react-components';
import DataGraph from '../DataGraph/DataGraph';
import ExportButtons from '../ExportButtons';
import { exportDataToWorksheet } from '../../../core/export';
import { getTimeseries } from '../../../data-services/ce-backend';
import {
  validateAnnualCycleData,
} from '../../../core/util';
import {
  noDataMessageGraphSpec,
  errorMessage,
  loadingDataGraphSpec,
} from '../graph-helpers';
import get from 'lodash/fp/get';
import { datasetSelectorLabel } from
    '../../guidance-content/info/InformationItems';
import styles from './AnnualCycleGraph.module.css';


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

  // Lifecycle hooks
  // Follows React 16+ lifecycle API and recommendations.
  // See https://reactjs.org/blog/2018/03/29/react-v-16-3.html
  // See https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html
  // See https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html

  static instance = 0;  // for debugging
  constructor(props) {
    // Multiple instances of this component are created by SingleDataController.
    // The instance and state variables `instance` are used to identify the
    // instance in debug logging, etc. I'm keeping this because there is still
    // some sleuthing to do that can use it.
    // (https://github.com/pacificclimate/climate-explorer-frontend/issues/258)
    super(props);
    this.instance = AnnualCycleGraph.instance++;  // for debugging

    // See ../README for an explanation of the content and usage
    // of state values. This is important for understanding how this
    // component works.

    this.state = {
      instance: this.instance,  // for debugging
      prevMeta: null,
      prevArea: null,
      prevDataspec: null,
      dataspec: undefined,
      fetchingData: false,
      data: null,
      dataError: null,
    };
  }

  static getDerivedStateFromProps(props, state) {
    // This function is called whenever a component may be updated,
    // due either to props change or to *state change*.

    // Props change.
    // Assumes that metadata changes when model, variable, or experiment does.
    if (
      props.meta !== state.prevMeta ||
      props.area !== state.prevArea
    ) {
      return {
        prevMeta: props.meta,
        prevArea: props.area,
        fetchingData: false,  // not quite yet
        data: null,  // Signal that data fetch is required
        dataError: null,
      };
    }

    // State change (dataspec). Signal need for data fetch.
    if (
      state.prevDataspec !== state.dataspec
    ) {
      return {
        prevDataspec: state.dataspec,
        fetchingData: false,  // not quite yet
        data: null,  // Signal that data fetch is required
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

  // TODO: Factor this out (used in other components)
  representativeValue = (optionName) => {
    // Extract a value from the representative for a named option.
    return get([optionName, 'value', 'representative'])(this.state);
  };

  getAndValidateData = (metadata) => (
    getTimeseries(metadata, this.props.area)
    .then(validateAnnualCycleData)
    .then(response => response.data)
  );

  getMetadatas = () =>
    // This fn is called multiple times, so memoize it if inefficient
    this.props.getMetadata(this.representativeValue('dataspec'))
    .filter(metadata => !!metadata);

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

  handleChangeDataspec = (dataspec) => {
    this.setState({ dataspec });
  };

  exportData(format) {
    exportDataToWorksheet(
      'timeseries',
      _.pick(this.props, 'model_id', 'variable_id', 'experiment', 'meta'),
      this.graphSpec(),
      format,
      this.state.dataspec
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
      return this.props.dataToGraphSpec(this.getMetadatas(), this.state.data);
    } catch (error) {
      // dataToGraphSpec may blow a raspberry if the data it is passed is
      // invalid. This won't happen due to mismatched dataspec and data,
      // because we don't allow that mismatch to occur.
      return noDataMessageGraphSpec(errorMessage(error));
    }
  }

  render() {
    return (
      <React.Fragment>
        <Row>
          <Col lg={6} md={6} sm={6}>
            <ControlLabel className={styles.selector_label}>
              {datasetSelectorLabel}
            </ControlLabel>
            <DataspecSelector
              bases={this.props.meta}
              value={this.state.dataspec}
              onChange={this.handleChangeDataspec}
              className={styles.selector}
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

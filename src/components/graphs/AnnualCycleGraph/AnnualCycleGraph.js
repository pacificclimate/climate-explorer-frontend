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
  defaultDataSpec,
  validateAnnualCycleData,
  validateUnstructuredTimeseriesData,
} from '../../../core/util';
import {
  noDataMessageGraphSpec,
  multiYearMeanSelected,
  errorMessage,
  loadingDataGraphSpec,
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

  ///////////////////////////////////////////////////////////////////////////
  // NEW

  // Lifecycle hooks
  // Follows React 16+ lifecycle API and recommendations.
  // See https://reactjs.org/blog/2018/03/29/react-v-16-3.html
  // See https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html
  // See https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html

  // Multiple of this component are created by SingleDataController.
  // The instance and state variables `instance` are used to identify the
  // instance in debug logging, etc. I'm keeping this because there is still
  // some sleuthing to do that can use it. (https://github.com/pacificclimate/climate-explorer-frontend/issues/258)
  static instance = 0;  // for debugging
  constructor(props) {
    console.log('ACG.constructor')
    super(props);
    this.instance = AnnualCycleGraph.instance++;  // for debugging

    // The content of `state.data` is determined by two qualitatively
    // different kinds of values:
    //
    //    props (specifically, `meta` and `area`)
    //    state (specifically, `dataSpec`)
    //
    // A change to any of these values triggers a data fetch.
    // The need for a data fetch is signalled by setting `data = null`.
    // The fact of a fetch in progress is signalled by `fetchingData`.
    // Signal, fetch initiation, and fetch completion occur separately.
    //
    // Between the time `dataSpec` changes and the time that the
    // data fetch completes, `dataSpec` and `data` are inconsistent, and any
    // computation based on them will be invalid (e.g., `this.graphSpec()`).
    // We must therefore treat dataSpec (and its changes) like props.
    // This requires putting the previous value of dataSpec on state as well,
    // so that it can, like props, be compared in `getDerivedStateFromProps`.
    // (Note: `getDerivedStateFromProps` does only has access to the current
    // state and props ... hence the need for prev values stored on state.
    // This comes directly from the design of and recommended practice
    // in React.)

    this.state = {
      instance: this.instance,  // for debugging
      prevMeta: null,
      prevArea: null,
      prevDataSpec: null,
      dataSpec: null,
      fetchingData: false,
      data: null,
      dataError: null,
    };
  }

  static getDerivedStateFromProps(props, state) {
    // This function is called whenever a component may be udpated, either
    // due to props change or *state change*.

    // Props change.
    // Assumes that metadata changes when model, variable, or experiment does.
    // Set up dataSpec to default based on new props, signal need for
    // data fetch.
    if (
      props.meta !== state.prevMeta ||
      props.area !== state.prevArea
    ) {
      const dataSpec = defaultDataSpec(props);
      return {
        prevMeta: props.meta,
        prevArea: props.area,
        // Avoid triggering an unnecessary second second data fetch due to
        // change in dataSpec.
        prevDataSpec: dataSpec,
        dataSpec,
        fetchingData: false,  // not quite yet
        data: null,  // Signal that data fetch is required due to props change
        dataError: null,
      };
    }

    // State change (dataSpec). Signal need for data fetch.
    if (
      state.prevDataSpec !== state.dataSpec
    ) {
      return {
        prevDataSpec: state.dataSpec,
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
    const validateData = multiYearMeanSelected(this.props) ?
      validateAnnualCycleData :
      validateUnstructuredTimeseriesData;
    return (
      getTimeseries(metadata, this.props.area)
      .then(validateData)
      .then(response => response.data)
    );
  }

  getMetadatas = () =>
    // This fn is called multiple times, so memoize it if inefficient
    this.props.getMetadata(this.state.dataSpec)
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

  // TODO: Refactor to eliminate encoding of dataSpec
  handleChangeDataSpec = (dataSpec) => {
    this.setState({ dataSpec: JSON.parse(dataSpec) });
  };

  exportData(format) {
    exportDataToWorksheet(
      'timeseries',
      _.pick(this.props, 'model_id', 'variable_id', 'experiment', 'meta'),
      this.graphSpec(),
      format,
      this.state.dataSpec
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
      // invalid. This won't happen due to mismatched dataSpec and data,
      // because we don't allow that mismatch to occur.
      return noDataMessageGraphSpec(errorMessage(error));
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
            <DataGraph {...this.graphSpec()}/>
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

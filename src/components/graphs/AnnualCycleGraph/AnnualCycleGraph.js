import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col } from 'react-bootstrap';

import _ from 'underscore';

import DatasetSelector from '../../DatasetSelector/DatasetSelector';
import DataGraph from '../../DataGraph/DataGraph';
import ExportButtons from '../ExportButtons';
import {
  sortSeriesByRank,
  timeseriesToAnnualCycleGraph,
} from '../../../core/chart';
import { findMatchingMetadata } from '../graph-helpers';
import { exportDataToWorksheet } from '../../../core/export';
import { getTimeseries } from "../../../data-services/ce-backend";
import {
  validateAnnualCycleData,
  validateUnstructuredTimeseriesData
} from "../../../core/util";
import {
  multiYearMeanSelected,
  displayError,
} from '../../../core/data-controller-helpers';


export default class AnnualCycleGraph extends React.Component {
  static propTypes = {
    meta: PropTypes.array,
    model_id: PropTypes.string,
    variable_id: PropTypes.string,
    experiment: PropTypes.string,
    getInstanceMetadata: PropTypes.func,
    // `getInstanceMetadata` returns the metadata describing the datasets to
    // be displayed in this component.
    dataToGraphSpec: PropTypes.func,
    // `dataToGraphSpec` converts data (monthly, seasonal, annual cycle data)
    // to a graph spec. A different function is passed by different controllers
    // specializing this general component to particular cases (single vs. dual
    // controllers, etc.)
  };

  constructor(props) {
    super(props);

    const { start_date, end_date, ensemble_member } =
      this.firstMonthlyMetadata(this.props);
    this.state = {
      instance: { start_date, end_date, ensemble_member },
      graphSpec: undefined,
    };
  }
  
  firstMonthlyMetadata({ meta, model_id, variable_id, experiment }) {
    return _.findWhere(
      meta,
      { model_id, variable_id, experiment, timescale: 'monthly' }
    );
  }

  //Removes all data from the Annual Cycle graph and displays a message
  // TODO: set on either loading flag or empty data
  setAnnualCycleGraphNoDataMessage = (message) => {
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
        axis: {}
      },
    });
  };

  getAndValidateTimeseries(props, timeseriesDatasetId) {
    const validate = multiYearMeanSelected(props) ?
      validateAnnualCycleData :
      validateUnstructuredTimeseriesData;
    return (
      getTimeseries({ ...props, timeseriesDatasetId })
        .then(validate)
    );
  }

  /*
   * This function retrieves fetches monthly, seasonal, and yearly resolution
   * annual cycle data and displays them on the graph. If instance (an object
   * with start_date, end_date, and ensemble_member attributes) is provided, data
   * matching those parameters will be selected; otherwise an arbitrary set
   * of data matching the other parameters.
   */
  loadAnnualCycleGraph(props) {
    //load Annual Cycle graph - need monthly, seasonal, and yearly data

    this.setAnnualCycleGraphNoDataMessage('Loading Data');
    
    // const {
    //   model_id, experiment,
    //   variable_id, meta,
    //   comparand_id, comparandMeta,
    // } = props;
    //
    // // Set up metadata sets for variable
    // const monthlyVariableMetadata = _.findWhere(props.meta, {
    //   model_id, experiment, variable_id,
    //   ...this.state.instance,
    //   timescale: 'monthly',
    // });
    // const monthlyComparandMetadata = findMatchingMetadata(
    //   monthlyVariableMetadata, { variable_id: comparand_id }, comparandMeta
    // );
    //
    // const seasonalVariablelMetadata = findMatchingMetadata(
    //   monthlyVariableMetadata, { timescale: 'seasonal' }, meta
    // );
    // const yearlyVariableMetadata = findMatchingMetadata(
    //   monthlyVariableMetadata, { timescale: 'yearly' }, meta
    // );
    //
    // let metadataSets = [
    //   monthlyVariableMetadata,
    //   seasonalVariablelMetadata,
    //   yearlyVariableMetadata,
    // ];
    //
    // // Extend metadata sets with comparand, if present and different from variable
    // if (
    //   monthlyComparandMetadata &&
    //   monthlyComparandMetadata.unique_id !== monthlyVariableMetadata.unique_id
    // ) {
    //   const seasonalComparandlMetadata = findMatchingMetadata(
    //     monthlyComparandMetadata, { timescale: 'seasonal' }, comparandMeta
    //   );
    //   const yearlyComparandMetadata = findMatchingMetadata(
    //     monthlyComparandMetadata, { timescale: 'yearly' }, comparandMeta
    //   );
    //   metadataSets = metadataSets.concat([
    //     monthlyComparandMetadata,
    //     seasonalComparandlMetadata,
    //     yearlyComparandMetadata,
    //   ]);
    // }

    //fetch data from the API for each time resolution that has a dataset.
    //the 'monthly' time resolution is guarenteed to exist, but
    //matching seasonal and yearly ones may not be in the database.
    const timeseriesPromises =
      this.props.getInstanceMetadata(this.state.instance)
        .filter(tsMeta => !!tsMeta)
        .map(tsMeta => this.getAndValidateTimeseries(props, tsMeta.unique_id));

    Promise.all(timeseriesPromises).then(series => {
      var data = _.pluck(series, 'data');
      this.setState({
        graphSpec: this.props.dataToGraphSpec(props.meta, data),
      });
    }).catch(error => {
      displayError(error, this.setAnnualCycleGraphNoDataMessage);
    });
  }

  // TODO: Refactor to eliminate encoding of instance (dataset).
  handleChangeInstance = (instance) => {
    this.setState({ instance: JSON.parse(instance) });
  };

  blankGraph = {
    data: {
      columns: [],
    },
    axis: {},
  };

  exportAnnualCycleData(format) {
    exportDataToWorksheet(
      'timeseries',
      _.pick(this.props, 'model_id', 'variable_id', 'experiment', 'meta'),
      this.state.graphSpec,
      format,
      this.state.instance
    );
  }
  
  handleExportXslx = this.exportAnnualCycleData.bind(this, 'xslx');
  handleExportCsv = this.exportAnnualCycleData.bind(this, 'csv');
  
  // Lifecycle hooks

  componentDidMount() {
    this.loadAnnualCycleGraph(this.props);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.meta !== this.props.meta ||
      !_.isEqual(prevState.instance, this.state.instance)
    ) {
      this.loadAnnualCycleGraph(this.props);
    }
  }

  render() {
    const graphSpec = this.state.graphSpec || this.blankGraph;
    
    return (
      <React.Fragment>
        <Row>
          <Col lg={4} lgPush={8} md={6} mdPush={6} sm={6} smPush={6}>
            <DatasetSelector
              meta={this.props.meta}
              // TODO: Refactor to eliminate encoding of dataset.
              value={JSON.stringify(this.state.instance)}
              onChange={this.handleChangeInstance}
            />
          </Col>
          <Col lg={4} lgPush={1} md={6} mdPush={1} sm={6} smPush={1}>
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

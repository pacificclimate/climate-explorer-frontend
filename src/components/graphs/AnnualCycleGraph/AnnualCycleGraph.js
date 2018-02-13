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

  // TODO: This fn becomes a prop
  dataToGraphSpec(meta, data) {
    var graph = timeseriesToAnnualCycleGraph(meta, ...data);

    //arrange the graph so that the highest-resolution data is most visible.
    var rankByTimeResolution = function (series) {
      var resolutions = ['Yearly', 'Seasonal', 'Monthly'];
      for(let i = 0; i < 3; i++) {
        if(series[0].search(resolutions[i]) != -1) {
          return i;
        }
      }
      return 0;
    }
    graph = sortSeriesByRank(graph, rankByTimeResolution);


  }

  /*
   * This function retrieves fetches monthly, seasonal, and yearly resolution
   * annual cycle data and displays them on the graph. If instance (an object
   * with start_date, end_date, and ensemble_member attributes) is provided, data
   * matching those parameters will be selected; otherwise an arbitrary set
   * of data matching the other parameters.
   */
  loadAnnualCycleGraph(props) {
    // TODO: only props.meta is ever used

    //load Annual Cycle graph - need monthly, seasonal, and yearly data

    // TODO: This function should just load data. Remainder of it should go
    // into a combination of data service methods and methods in AnnualCycleGraph

    // TODO: Set state.loading flag instead?
    this.setAnnualCycleGraphNoDataMessage('Loading Data');

    const monthlyMetadata = _.findWhere(props.meta, {
      ...this.state.instance, timescale: 'monthly',
    });
    const seasonalMetadata = findMatchingMetadata(monthlyMetadata, { timescale: 'seasonal' }, props.meta);
    const yearlyMetadata = findMatchingMetadata(monthlyMetadata, { timescale: 'yearly' }, props.meta);

    //fetch data from the API for each time resolution that has a dataset.
    //the 'monthly' time resolution is guarenteed to exist, but
    //matching seasonal and yearly ones may not be in the database.
    const timeseriesPromises = [
      monthlyMetadata,
      seasonalMetadata,
      yearlyMetadata,
    ]
      .filter(tsMeta => !!tsMeta)
      .map(tsMeta => this.getAndValidateTimeseries(props, tsMeta.unique_id));

    Promise.all(timeseriesPromises).then(series => {
      var data = _.pluck(series, 'data');
      this.setState({
        graphSpec: this.dataToGraphSpec(props.meta, data),
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

  exportAnnualCycle(format) {
    //Determine period and run to export. Location varies depending on the portal and whether
    //it displays a single datafile or multiple datafiles at once. 
    //Period and run parameters describing a set of multiple displayed datafiles files are 
    //stored as this.state.timeseriesInstance. 
    //If the portal has only one active dataset at a time, run and period are 
    //extracted from that dataset's metadata.
    var instance;
    if (this.state.instance) {
      instance = this.state.instance;
    } else {
      // TODO: What?? What does timeseries have to do with annual cycle??
      // This is for the Moti portal. In that case, instance is
      // never defined and it defaults to this. We need to rewrite Moti portal
      // to not require this, because we aren't storing this information in
      // this component now. So there.
      instance = _.pick(this.getMetadata(this.state.timeseriesDatasetId),
        'start_date', 'end_date', 'ensemble_member');
    }
    exportDataToWorksheet('timeseries', this.props, this.state.graphSpec, format, instance);
  }
  
  handleExportXslx = this.exportAnnualCycle.bind(this, 'xslx');
  handleExportCsv = this.exportAnnualCycle.bind(this, 'csv');
  
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

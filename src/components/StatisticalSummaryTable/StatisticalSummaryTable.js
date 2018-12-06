// Statistical Summary Table: Panel containing a Data Table viewer component
// showing statistical information for each climatology period or timeseries.

import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col, Panel } from 'react-bootstrap';

import _ from 'underscore';

import DataTable from '../DataTable/DataTable';
import TimeOfYearSelector from '../Selector/TimeOfYearSelector';
import ExportButtons from '../graphs/ExportButtons';
import { statsTableLabel } from '../guidance-content/info/InformationItems';
import { MEVSummary } from '../data-presentation/MEVSummary';

import styles from './StatisticalSummaryTable.css';
import { getStats } from '../../data-services/ce-backend';
import {
  defaultTimeOfYear,
  parseBootstrapTableData,
  timeKeyToResolutionIndex,
  timeResolutions,
  validateStatsData,
} from '../../core/util';

// TODO: Replace stub with import when new code integrated from LTA graph fix
// import { errorMessage } from '../graphs/graph-helpers';
const errorMessage = () => 'Error fetching data.';  // Temporary stub.

import { exportDataToWorksheet } from '../../core/export';


export default class StatisticalSummaryTable extends React.Component {
  static propTypes = {
    model_id: PropTypes.string,
    variable_id: PropTypes.string,
    experiment: PropTypes.string,
    area: PropTypes.string,
    meta: PropTypes.array,
    contextMeta: PropTypes.array,
  };

  // Lifecycle hooks
  // Follows React 16+ lifecycle API and recommendations.
  // See https://reactjs.org/blog/2018/03/29/react-v-16-3.html
  // See https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html
  // See https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html

  constructor(props) {
    super(props);

    this.state = {
      prevMeta: null,
      prevArea: null,
      timeOfYear: defaultTimeOfYear(timeResolutions(this.props.meta)),
      data: null,
      dataError: null,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (
      props.meta !== state.prevMeta ||
      props.area !== state.prevArea
    ) {
      return {
        prevMeta: props.meta,
        prevArea: props.area,
        timeOfYear: defaultTimeOfYear(timeResolutions(props.meta)),
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
    if (
      // props changed => data invalid
      this.state.data === null ||
      // user selected new time of year
      this.state.timeOfYear !== prevState.timeOfYear
    ) {
      this.fetchData();
    }
  }

  // Data fetching

  getAndValidateData(metadata) {
    return (
      getStats(metadata)
      .then(validateStatsData)
      .then(response => response.data)
    );
  }

  injectRunIntoStats(data) {
    // TODO: Make this into a pure function
    // Injects model run information into object returned by stats call
    _.map(data, function (val, key) {
      const selected = this.props.meta.filter(el => el.unique_id === key);
      _.extend(val, { run: selected[0].ensemble_member });
    }.bind(this));
    return data;
  }

  fetchData() {
    const metadata = {
      ..._.pick(this.props,
        'ensemble_name', 'model_id', 'variable_id', 'experiment', 'area'),
      ...timeKeyToResolutionIndex(this.state.timeOfYear),
    };
    this.getAndValidateData(metadata)
    .then(data => {
      this.setState({
        data: parseBootstrapTableData(
          this.injectRunIntoStats(data), this.props.meta),
        dataError: null,
      });
    }).catch(dataError => {
      this.setState({
        // Do we have to set data non-null here to prevent infinite update loop?
        dataError,
      });
    });
  }

  // User event handlers

  handleChangeTimeOfYear = (timeOfYear) => {
    this.setState({ timeOfYear });
  };

  exportDataTable(format) {
    exportDataToWorksheet(
      'stats', this.props, this.state.data, format,
      { timeidx: this.state.timeOfYear,
        timeres: this.state.dataTableTimeScale }
    );
  }

  // render helpers

  dataTableOptions() {
    // Return a data table options object appropriate to the current state.

    // An error occurred
    if (this.state.dataError) {
      return { noDataText: errorMessage(this.state.dataError) };
    }

    // Waiting for data
    if (this.state.data === null) {
      return { noDataText: 'Loading data...' };
    }

    // We can haz data
    return { noDataText: 'We have data and this message should not show' };
  }

  render() {
    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title>
            <Row>
              <Col lg={4}>
                {statsTableLabel}
              </Col>
              <Col lg={8}>
                <MEVSummary className={styles.mevSummary} {...this.props} />
              </Col>
            </Row>
          </Panel.Title>
        </Panel.Heading>
        <Panel.Body className={styles.data_panel}>
          <Row>
            <Col lg={6} md={6} sm={6}>
              <TimeOfYearSelector
                value={this.state.timeOfYear}
                onChange={this.handleChangeTimeOfYear}
                {...timeResolutions(this.props.meta)}
                inlineLabel
              />
            </Col>
            <Col lg={6} md={6} sm={6}>
              <ExportButtons
                onExportXlsx={this.exportDataTable.bind(this, 'xlsx')}
                onExportCsv={this.exportDataTable.bind(this, 'csv')}
              />
            </Col>
          </Row>
          <DataTable
            data={this.state.data || []}
            options={this.dataTableOptions()}
          />
        </Panel.Body>
      </Panel>
    );
  }
}

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
  parseBootstrapTableData, resolutionIndexToTimeKey, timeKeyToResolutionIndex,
  validateStatsData,
} from '../../core/util';
import { displayError, multiYearMeanSelected } from '../graphs/graph-helpers';
import { exportDataToWorksheet } from '../../core/export';


export default class StatisticalSummaryTable extends React.Component {
  static propTypes = {
    model_id: PropTypes.string,
    variable_id: PropTypes.string,
    experiment: PropTypes.string,
    area: PropTypes.string,
    meta: PropTypes.array,
    contextMeta: PropTypes.array,
    ensemble_name: PropTypes.string,  // TODO: Why is this declared? Remove?
  };

  constructor(props) {
    super(props);

    this.state = {
      dataTableTimeOfYear: 0,
      dataTableTimeScale: 'monthly',
      statsData: undefined,
    };
  }
  
  /*
   * Called when SingleDataController is first loaded. Selects and fetches
   * arbitrary initial data to display in the graphs and stats table.
   * Monthly time resolution, January, on the first run returned by the API.
   */
  getData(props) {
    //if the selected dataset is a multi-year mean, load annual cycle
    //and long term average graphs, otherwise load a timeseries graph
    if (multiYearMeanSelected(props)) {
      this.loadDataTable(props);
    } else {
      this.loadDataTable(props, { timeidx: 0, timescale: 'yearly' });
    }
  }

  //Removes all data from the Stats Table and displays a message
  setStatsTableNoDataMessage(message) {
    this.setState({
      statsTableOptions: { noDataText: message },
      statsData: [],
    });
  }

  /*
   * Called when the user selects a time of year to display on the stats
   * table. Fetches new data, records the new time index and resolution
   * in state, and updates the table.
   */
  updateDataTableTimeOfYear = (timeidx) => {
    this.loadDataTable(this.props, timeKeyToResolutionIndex(timeidx));
  }

  /*
   * This function fetches and loads data for the Stats Table.
   * If passed a time of year(resolution and index), it will load
   * data for that time of year. Otherwise, it defaults to January
   * (resolution: "monthly", index 0).
   */
  loadDataTable(props, time) {
    const timeidx = time ? time.timeidx : this.state.dataTableTimeOfYear;
    const timeres = time ? time.timescale : this.state.dataTableTimeScale;

    //load stats table
    this.setStatsTableNoDataMessage('Loading Data');
    const myStatsPromise = getStats(props, timeidx, timeres).then(validateStatsData);

    myStatsPromise.then(response => {
      if (_.allKeys(response.data).length > 0) {
        this.setState({
          dataTableTimeOfYear: timeidx,
          dataTableTimeScale: timeres,
          statsData: parseBootstrapTableData(
            this.injectRunIntoStats(response.data), props.meta),
        });
      } else {
        this.setState({
          dataTableTimeOfYear: timeidx,
          dataTableTimeScale: timeres,
        });
        this.setStatsTableNoDataMessage('Statistics unavailable for this time period.');
      }
    }).catch(error => {
      displayError(error, this.setStatsTableNoDataMessage);
    });
  }

  verifyParams(props) {
    const stringPropList = _.values(_.pick(props, 'ensemble_name', 'meta', 'model_id', 'variable_id', 'experiment'));
    return (stringPropList.length > 0) && stringPropList.every(Boolean);
  }

  componentDidMount() {
    if (this.verifyParams(this.props)) {
      this.getData(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.verifyParams(nextProps) && nextProps.meta.length > 0) {
      this.getData(nextProps);
    } else { //Didn't receive any valid data.
      //Most likely cause in production would be the user selecting
      //parameters (rcp, model, constiable) for which no datasets have been
      //added to the database yet.
      //In development, could be API or ensemble misconfiguration, database down.
      //Display an error message on each viewer in use by this datacontroller.
      const text = 'No data matching selected parameters available';
      const viewerMessageDisplays = [this.setStatsTableNoDataMessage];
      _.each(viewerMessageDisplays, function (display) {
        if (typeof display === 'function') {
          display(text);
        }
      });
    }
  }

  exportDataTable(format) {
    exportDataToWorksheet(
      'stats', this.props, this.state.statsData, format,
      { timeidx: this.state.dataTableTimeOfYear,
        timeres: this.state.dataTableTimeScale }
    );
  }

  injectRunIntoStats(data) {
    // Injects model run information into object returned by stats call
    _.map(data, function (val, key) {
      const selected = this.props.meta.filter(el => el.unique_id === key);
      _.extend(val, { run: selected[0].ensemble_member });
    }.bind(this));
    return data;
  }

  //Returns the metadata object that corresponds to a unique_id
  getMetadata(id, meta = this.props.meta) {
    return _.find(meta, { unique_id: id });
  }

  shouldComponentUpdate(nextProps, nextState) {
    // This guards against re-rendering before calls to the data sever alter the
    // state
    // TODO: Consider making shallow comparisons. Deep ones are expensive.
    // If immutable data objects are used (or functionally equivalently,
    // new data objects each time), then shallow comparison works.
    return !(
      _.isEqual(nextState.statsData, this.state.statsData) &&
      _.isEqual(nextProps.meta, this.props.meta) &&
      _.isEqual(nextState.statsTableOptions, this.state.statsTableOptions) &&
      _.isEqual(nextProps.area, this.props.area)
    );
  }

  render() {
    const statsData = this.state.statsData ? this.state.statsData : [];

    const dataTableSelected = resolutionIndexToTimeKey(
      this.state.dataTableTimeScale,
      this.state.dataTableTimeOfYear
    );

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
                onChange={this.updateDataTableTimeOfYear}
                value={dataTableSelected}
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
          <DataTable data={statsData} options={this.state.statsTableOptions}/>
        </Panel.Body>
      </Panel>
    );
  }
}

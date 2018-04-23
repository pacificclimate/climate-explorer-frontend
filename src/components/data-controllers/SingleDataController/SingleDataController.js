/*******************************************************************
 * SingleDataController.js - controller component for in-depth numerical
 * visualization of a single variable
 *
 * Receives a model, an experiment, and a variable from its parent,
 * SingleAppController. Manages viewer components that display data as
 * graphs or tables. 
 *
 * Child components vary by whether the selected dataset is a multi year mean
 * climatology. If so:
 *  - a SingleAnnualCycleGraph displaying data with monthly, seasonal, and annual
 *    resolution (as available)
 * 
 *  - a SingleLongTermAverageGraph showing the mean of each climatology
 *    period as a seperate data point.
 *
 *  - a SingleContextGraph similar to the Long Term Average graph, but with
 *    a separate line for each model and simplified presentation.
 *
 * If the selected dataset is not a multi year mean:
 *  - a freeform SingleTimeSeriesGraph showing each time point available.
 *
 * A Data Table viewer component showing statistical information for each
 * climatology period or timeseries is also generated. 
 *******************************************************************/

import PropTypes from 'prop-types';

import React from 'react';
import createReactClass from 'create-react-class';
import { Button, Row, Col, Tab, Tabs } from 'react-bootstrap';
import _ from 'underscore';

import styles from './SingleDataController.css';

import { parseBootstrapTableData,
         timeKeyToResolutionIndex,
         resolutionIndexToTimeKey,
         validateStatsData} from '../../../core/util';
import DataTable from '../../DataTable/DataTable';
import TimeOfYearSelector from '../../Selector/TimeOfYearSelector';
import DataControllerMixin from '../../DataControllerMixin';
import { displayError, multiYearMeanSelected } from '../../graphs/graph-helpers';
import SingleAnnualCycleGraph from '../../graphs/SingleAnnualCycleGraph';
import SingleLongTermAveragesGraph from '../../graphs/SingleLongTermAveragesGraph';
import SingleContextGraph from '../../graphs/SingleContextGraph';
import SingleTimeSeriesGraph from '../../graphs/SingleTimeSeriesGraph';
import { getStats } from '../../../data-services/ce-backend';

// TODO: Remove DataControllerMixin and convert to class extension style when 
// no more dependencies on DataControllerMixin remain
export default createReactClass({
  displayName: 'SingleDataController',

  propTypes: {
    model_id: PropTypes.string,
    variable_id: PropTypes.string,
    experiment: PropTypes.string,
    area: PropTypes.string,
    meta: PropTypes.array,
    contextMeta: PropTypes.array,
    ensemble_name: PropTypes.string,
  },

  mixins: [DataControllerMixin],

  getInitialState: function () {
    return {
      dataTableTimeOfYear: 0,
      dataTableTimeScale: "monthly",
      statsData: undefined,
    };
  },

  /*
   * Called when SingleDataController is first loaded. Selects and fetches 
   * arbitrary initial data to display in the graphs and stats table. 
   * Monthly time resolution, January, on the first run returned by the API.
   */
  getData: function (props) {
    //if the selected dataset is a multi-year mean, load annual cycle
    //and long term average graphs, otherwise load a timeseries graph
    if (multiYearMeanSelected(props)) {
      this.loadDataTable(props);
    }
    else {
      this.loadDataTable(props, {timeidx: 0, timescale: "yearly"});
    }
  },

  //Removes all data from the Stats Table and displays a message
  setStatsTableNoDataMessage: function(message) {
    this.setState({
      statsTableOptions: { noDataText: message },
      statsData: [],
    });
  },

  shouldComponentUpdate: function (nextProps, nextState) {
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
  },

  /*
   * Called when the user selects a time of year to display on the stats
   * table. Fetches new data, records the new time index and resolution
   * in state, and updates the table.
   */
  updateDataTableTimeOfYear: function (timeidx) {
    this.loadDataTable(this.props, timeKeyToResolutionIndex(timeidx));
  },

  /*
   * This function fetches and loads data for the Stats Table. 
   * If passed a time of year(resolution and index), it will load
   * data for that time of year. Otherwise, it defaults to January 
   * (resolution: "monthly", index 0). 
   */
  loadDataTable: function (props, time) {
    
    var timeidx = time ? time.timeidx : this.state.dataTableTimeOfYear;
    var timeres = time ? time.timescale : this.state.dataTableTimeScale;

    //load stats table
    this.setStatsTableNoDataMessage("Loading Data");
    var myStatsPromise = getStats(props, timeidx).then(validateStatsData);

    myStatsPromise.then(response => {
      //remove all results from datasets with the wrong timescale
      var stats = this.filterAPIResults(response.data, 
          {timescale: timeres}, props.meta);
      if(_.allKeys(stats).length > 0) {
        this.setState({
          dataTableTimeOfYear: timeidx,
          dataTableTimeScale: timeres,
          statsData: parseBootstrapTableData(this.injectRunIntoStats(stats), props.meta),
        });
      }
      else {
        this.setState({
          dataTableTimeOfYear: timeidx,
          dataTableTimeScale: timeres,
        });
        this.setStatsTableNoDataMessage("Statistics unavailable for this time period.");
      }
    }).catch(error => {
      displayError(error, this.setStatsTableNoDataMessage);
    });
  },

  render: function () {
    const statsData = this.state.statsData ? this.state.statsData : this.blankStatsData;

    const dataTableSelected = resolutionIndexToTimeKey(
      this.state.dataTableTimeScale,
      this.state.dataTableTimeOfYear
    );

    return (
      <div>
        <h3>
          {this.props.model_id} {' '}
          {this.props.variable_id} {' '}
          {this.props.experiment}
        </h3>
        
        {
          multiYearMeanSelected(this.props) ? (

            <Tabs id="Graphs">
              <Tab eventKey={1} title='Annual Cycle'>
                <SingleAnnualCycleGraph {...this.props}/>
              </Tab>
              <Tab eventKey={2} title='Long Term Averages'>
                <SingleLongTermAveragesGraph {...this.props}/>
              </Tab>
              <Tab eventKey={3} title='Model Context'>
                <SingleContextGraph {...this.props}/>
              </Tab>
            </Tabs>

          ) : (

            <Tabs id="Graphs">
              <Tab eventKey={1} title='Time Series'>
                <SingleTimeSeriesGraph {...this.props}/>
              </Tab>
            </Tabs>

          )
        }

        <Row>
          <Col lg={4} lgPush={8} md={6} mdPush={6} sm={6} smPush={6}>
            <TimeOfYearSelector onChange={this.updateDataTableTimeOfYear} value={dataTableSelected} />
          </Col>
        </Row>
        <DataTable data={statsData}  options={this.state.statsTableOptions}/>
        <div style={{ marginTop: '10px' }}>
          <Button style={{ marginRight: '10px' }} onClick={this.exportDataTable.bind(this, 'xlsx')}>Export To XLSX</Button>
          <Button onClick={this.exportDataTable.bind(this, 'csv')}>Export To CSV</Button>
        </div>
      </div>
    );
  },
});
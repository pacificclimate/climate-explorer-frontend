/*******************************************************************
 * DataController.js - controller component for in-depth numerical
 * visualization
 *
 * Receives a model, an experiment, and a variable from its parent,
 * AppController. Presents the user with widgets to allow selection 
 * of a particular slice of data (time of year or run) and download 
 * of selected data. 
 *
 * Queries the API to retrieve the selected data generates graphs and
 * tables from it as viewing components. 
 *
 * If the selected dataset is a multi year mean climatology:
 *  - an Annual Cycle Datagraph with monthly, seasonal, and annual
 *    resolution (if available)
 * 
 *  - a Long Term Average Datagraph showing the mean of each climatology
 *    period as a seperate data point.
 *
 *  - a Model Context Datagraph similar to the Long Term Average
 *    Datagraph, but with a separate line for each model.
 *
 * If the selected dataset is not a multi year mean:
 *  - a Time Series Datagraph showing each time point available.
 *
 * A Data Table viewer component showing statistical information for each
 * climatology period or timeseries is also generated. 
 *******************************************************************/

import PropTypes from 'prop-types';

import React from 'react';
import createReactClass from 'create-react-class';
import { Button, Row, Col, Tab, Tabs } from 'react-bootstrap';
import _ from 'underscore';

import styles from './DataController.css';

import { parseBootstrapTableData,
         timeKeyToResolutionIndex,
         resolutionIndexToTimeKey} from '../../core/util';
import {timeseriesToAnnualCycleGraph,
        dataToLongTermAverageGraph,
        timeseriesToTimeseriesGraph,
        assignColoursByGroup,
        fadeSeriesByRank,
        hideSeriesInLegend,
        sortSeriesByRank} from '../../core/chart';
import DataTable from '../DataTable/DataTable';
import TimeOfYearSelector from '../Selector/TimeOfYearSelector';
import DataControllerMixin from '../DataControllerMixin';
import AnnualCycleGraph from '../graphs/AnnualCycleGraph';
import LongTermAveragesGraph from '../graphs/LongTermAveragesGraph';
import ContextGraph from '../graphs/ContextGraph';
import TimeSeriesGraph from '../graphs/TimeSeriesGraph';
import { findMatchingMetadata } from '../graphs/graph-helpers';

// TODO: Remove DataControllerMixin and convert to class extension style when 
// no more dependencies on DataControllerMixin remain
var DataController = createReactClass({
  displayName: 'DataController',

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
      // TODO:Remove when TimeSeriesGraph tested
      // timeseriesData: undefined,
      statsData: undefined,
    };
  },

  /*
   * Called when DataController is first loaded. Selects and fetches 
   * arbitrary initial data to display in the graphs and stats table. 
   * Monthly time resolution, January, on the first run returned by the API.
   */
  getData: function (props) {
    //if the selected dataset is a multi-year mean, load annual cycle
    //and long term average graphs, otherwise load a timeseries graph
    if(this.multiYearMeanSelected(props)) {
      this.loadDataTable(props);
    }
    else {
      // TODO: Remove when TimeSeriesGraph tested
      // this.loadTimeseriesGraph(props);
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

  // TODO:Remove when TimeSeriesGraph tested
  //Removes all data from the Timeseries Graph and displays a message
  // setTimeseriesGraphNoDataMessage: function(message) {
  //   this.setState({
  //     timeseriesData: { data: { columns: [], empty: { label: { text: message }, }, },
  //                        axis: {} },
  //     });
  // },

  shouldComponentUpdate: function (nextProps, nextState) {
    // This guards against re-rendering before calls to the data sever alter the
    // state
    return !(
      _.isEqual(nextState.statsData, this.state.statsData) &&
      // TODO:Remove when TimeSeriesGraph tested
      // _.isEqual(nextState.timeseriesData, this.state.timeseriesData) &&
      _.isEqual(nextProps.meta, this.props.meta) &&
      _.isEqual(nextState.statsTableOptions, this.state.statsTableOptions)
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

  getAnnualCycleInstanceMetadata(instance) {
    // Find and return metadata matching model_id, experiment, variable_id
    // and instance (start_date, end_date, ensemble_name) for monthly, seasonal
    // and annual timescales.
    const {
      model_id, experiment,
      variable_id, meta,
    } = this.props;

    const monthlyVariableMetadata = _.findWhere(meta, {
      model_id, experiment, variable_id,
      ...instance,
      timescale: 'monthly',
    });
    const seasonalVariablelMetadata = findMatchingMetadata(
      monthlyVariableMetadata, { timescale: 'seasonal' }, meta
    );
    const yearlyVariableMetadata = findMatchingMetadata(
      monthlyVariableMetadata, { timescale: 'yearly' }, meta
    );
    const metadataSets = [
      monthlyVariableMetadata,
      seasonalVariablelMetadata,
      yearlyVariableMetadata,
    ];
    return metadataSets;
  },

  dataToAnnualCycleGraphSpec(meta, data) {
    let graph = timeseriesToAnnualCycleGraph(meta, ...data);

    // arrange the graph so that the highest-resolution data is most visible.
    function rankByTimeResolution(series) {
      var resolutions = ['Yearly', 'Seasonal', 'Monthly'];
      for (let i = 0; i < 3; i++) {
        if (series[0].search(resolutions[i]) !== -1) {
          return i;
        }
      }
      return 0;
    }
    graph = sortSeriesByRank(graph, rankByTimeResolution);

    return graph;
  },

  getLongTermAveragesMetadata(timeOfYear) {
    const metadataFromProps = _.pick(this.props,
      'ensemble_name', 'model_id', 'variable_id', 'experiment', 'area'
    );
    // Yes, the value of this function is an array of one element.
    return [
      { ...metadataFromProps, ...timeKeyToResolutionIndex(timeOfYear) },
    ];
  },

  longTermAveragesDataToGraphSpec(data) {
    return dataToLongTermAverageGraph(data);
  },

  // TODO:Remove when TimeSeriesGraph tested
  // /*
  //  * This function fetches and loads data for the Timeseries graph.
  //  * As the Timeseries graph shows all data points at once, there's no
  //  * filtering or selection done by this function.
  //  */
  // loadTimeseriesGraph: function(props) {
  //
  //   this.setTimeseriesGraphNoDataMessage("Loading Data");
  //
  //   var params = _.pick(props, 'model_id', 'variable_id', 'experiment');
  //
  //   var metadata = _.findWhere(props.meta, params);
  //
  //   var timeseriesPromise = this.getTimeseriesPromise(props, metadata.unique_id);
  //   timeseriesPromise.then(response => {
  //     this.setState({
  //       timeseriesData: timeseriesToTimeseriesGraph(props.meta, response.data)
  //     });
  //   }).catch(error => {
  //     this.displayError(error, this.setTimeseriesGraphNoDataMessage);
  //   });
  // },

  getTimeseriesMetadata() {
    const {
      model_id, experiment,
      variable_id, meta,
    } = this.props;

    const primaryVariableMetadata = _.findWhere(meta, {
      model_id, experiment, variable_id,
    });
    // Yes, the value of this function is an array of one element.
    const metadataSets = [primaryVariableMetadata];
    return metadataSets;
  },

  timeseriesDataToGraphSpec(meta, data) {
    return timeseriesToTimeseriesGraph(meta, ...data);
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
    var myStatsPromise = this.getStatsPromise(props, timeidx);

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
      this.displayError(error, this.setStatsTableNoDataMessage);
    });
  },

  getContextMetadata() {
    const {
      ensemble_name, experiment, variable_id, area, contextMeta,
    } = this.props;

    // Array of unique model_id's
    const uniqueContextModelIds = _.uniq(_.pluck(contextMeta, 'model_id'));
    const baseMetadata = {
      ensemble_name,
      experiment,
      variable_id,
      area,
      timescale: 'yearly',
      timeidx: 0,
      multi_year_mean: true,
    };
    const metadatas =
      uniqueContextModelIds
        .map(model_id => ({ ...baseMetadata, model_id }))
        .filter(metadata =>
          // Note: length > 0 guaranteed for first item
          // (containing this.props.model_id)
          _.where(contextMeta,
            _.omit(metadata, 'ensemble_name', 'timeidx', 'area')
          ).length > 0
        );
    return metadatas;
  },

  contextDataToGraphSpec(meta, data, selectedModelId) {
    const emphasizeCurrentModel = function(graph) {
      //Helper function used to classify data series by which model generated them
      const makeModelSegmentor = function (selectedModelOutput, otherModelOutput) {
        return function(dataseries) {
          return dataseries[0].search(selectedModelId) !== -1 ?
            selectedModelOutput :
            otherModelOutput;
        };
      };

      graph = assignColoursByGroup(graph, makeModelSegmentor(1, 0));
      graph = fadeSeriesByRank(graph, makeModelSegmentor(1, 0.35));
      graph = hideSeriesInLegend(graph, makeModelSegmentor(false, true));
      graph = sortSeriesByRank(graph, makeModelSegmentor(1, 0));

      //simplify graph by turning off tooltip and missing data gaps
      graph.line.connectNull = true;
      graph.tooltip = { show: false };
      return graph;
    };

    return emphasizeCurrentModel(dataToLongTermAverageGraph(data, meta));
  },

  render: function () {
    const statsData = this.state.statsData ? this.state.statsData : this.blankStatsData;

    const dataTableSelected = resolutionIndexToTimeKey(
      this.state.dataTableTimeScale,
      this.state.dataTableTimeOfYear
    );

    const graphProps = _.pick(this.props,
      'model_id', 'variable_id', 'experiment', 'meta', 'area'  
    );
    
    return (
      <div>
        <h3>
          {this.props.model_id} {' '}
          {this.props.variable_id} {' '}
          {this.props.experiment}
        </h3>
        
        {
          this.multiYearMeanSelected() ? (
            <Tabs>
              <Tab eventKey={1} title='Annual Cycle'>
                <AnnualCycleGraph
                  {...graphProps}
                  getInstanceMetadata={this.getAnnualCycleInstanceMetadata}
                  dataToGraphSpec={this.dataToAnnualCycleGraphSpec}
                />
              </Tab>
              <Tab eventKey={2} title='Long Term Averages'>
                <LongTermAveragesGraph
                  {...graphProps}
                  getMetadata={this.getLongTermAveragesMetadata}
                  dataToGraphSpec={this.longTermAveragesDataToGraphSpec}
                />
              </Tab>
              <Tab eventKey={3} title='Model Context'>
                <ContextGraph
                  {..._.pick(this.props,
                    'model_id', 'variable_id', 'experiment',
                    'contextMeta', 'area')}
                  getMetadata={this.getContextMetadata}
                  dataToGraphSpec={this.contextDataToGraphSpec}
                />
              </Tab>
            </Tabs>
          ) : (
            <Tabs>
              <Tab eventKey={1} title='Time Series'>
                <TimeSeriesGraph
                  {...graphProps}
                  getMetadata={this.getTimeseriesMetadata}
                  dataToGraphSpec={this.timeseriesDataToGraphSpec}
                />
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

export default DataController;

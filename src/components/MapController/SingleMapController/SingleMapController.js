/*******************************************************************
 * SingleMapController.js - Raster display of map data
 * 
 * This controller coordinates a map displaying data extracted from
 * netCDF files as a colour-coded raster, as well as a menu of 
 * viewing settings for the raster.
 * 
 * It is also responsible for passing user-drawn areas up to its 
 * parent.
 * 
 * Children:
 *   * Datamap, which actually renders the map
 *   * MapSettings, which allows user configuration of map layers
 *******************************************************************/


// Wires up components of overall map display for CE.
// Also contains some legacy code that should be further refactored, primarily
// `loadMap` and the handling of instances (see TODOs/FIXMEs).

import PropTypes from 'prop-types';
import React from 'react';
import Loader from 'react-loader';

import _ from 'underscore';

import '../MapController.css';
import DataMap from '../../DataMap';
import MapFooter from '../../MapFooter';
import MapSettings from '../../MapSettings';
import StaticControl from '../../StaticControl';
import GeoLoader from '../../GeoLoader';
import GeoExporter from '../../GeoExporter';

import { hasValidData, getRasterParamsPromise, selectedVariable } from '../map-helpers.js';


// TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/125
export default class MapController extends React.Component {
  static propTypes = {
    meta: PropTypes.array.isRequired,
    area: PropTypes.object,
    onSetArea: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      run: undefined,
      start_date: undefined,
      end_date: undefined,

      raster: {
        variableId: undefined, // formerly 'variable'
        times: undefined,
        timeIdx: undefined,
        wmsTime: undefined,
        palette: 'x-Occam',
        logscale: 'false',
        range: {},
      }
    };
  }

  // Support functions

  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/118
  currentInstance() {
    // Return encoding of currently selected instance
    return `${this.state.run} ${this.state.start_date}-${this.state.end_date}`;
    // WAAT? The below code is copied from existing MapController, but it
    // doesn't drive Selector correctly. *&*#$@*
    // return JSON.stringify({
    //   start_date: this.state.start_date,
    //   end_date: this.state.end_date,
    //   ensemble_member: this.state.run
    // });
  }

  // setState helpers

  updateLayerSimpleState(layerType, name, value) {
    this.setState(prevState => ({
      [layerType]: {
        ...prevState[layerType],
        [name]: value,
      },
    }));
  }

  updateLayerTime(layerType, timeIdx) {
    // update the timestamp in state
    // timeIdx is a stringified object with a resolution  (monthly, annual, seasonal)
    // and an index denoting the timestamp's position with the file
    this.setState((prevState) => ({
      [layerType]: {
        ...prevState[layerType],
        timeIdx,
        wmsTime: prevState[layerType].times[timeIdx],
      },
    }));
  }

  // Support functions for event/callback handlers

  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/125
  loadMap(
    props,
    instance,
    newVariable = false,
  ) {
    // update state with all the information needed to display
    // maps for a specific instance.
    // an 'instance' in this case is a variable + emissions + model + 
    // period + run combination. Timestamps for an instance may be spread 
    // across up to three files (one annual, one seasonal, one monthly). 
    // SingleMapController receives the variable, emissions, and model parameters
    // from its parent as props, and selects and stores the period and run 
    // in state, but doesn't select a specific file with a
    // specific unique_id until rendering, when it needs to pass an exact file
    // and timestamp to the viewer component.

    const { start_date, end_date, ensemble_member } = instance;
    
    let rasterParamsPromise = getRasterParamsPromise(instance, props.meta);
    rasterParamsPromise.then(params => {
      //if the variable has changed, use the default palette and logscale,
      //otherwise use the previous (user-selected) values from state.
      if(!newVariable) {
        params.palette = this.state.raster.palette;
        params.logscale = this.state.raster.logscale;
      }
      
      this.setState(prevState => ({
        run: ensemble_member,
        start_date,
        end_date,
        raster: params
      }));
    });  
  }

  // Handlers for dataset change

  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/118
  updateInstance = (encodedInstance) => {
    this.loadMap(this.props, JSON.parse(encodedInstance));
  };

  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/118
  // TODO: There may also be a second issue to do with encoding timeVarIdx
  getDatasetId(varSymbol, varMeta, encodedVarTimeIdx) {
    let dataset = undefined;
    if (encodedVarTimeIdx) {
      if (hasValidData(varSymbol, this.props)) {
        const timeIndex = JSON.parse(encodedVarTimeIdx);
        dataset = _.findWhere(varMeta, {
          ensemble_member: this.state.run,
          start_date: this.state.start_date,
          end_date: this.state.end_date,
          timescale: timeIndex.timescale,
        });
      }
    }
    // dataset may not exist if generating a map for a single-variable portal
    return dataset && dataset.unique_id;
  }
  
  // Handlers for time selection change

  handleChangeVariableTime = this.updateLayerTime.bind(this, 'raster');

  // Handlers for palette change

  handleChangeRasterPalette = this.updateLayerSimpleState.bind(this, 'raster', 'palette');

  // Handlers for layer range change

  handleChangeRasterRange = this.updateLayerSimpleState.bind(this, 'raster', 'range');

  // Handlers for scale change

  // TODO: Naming and values inherited from original code are inconsistent;
  // "scale" and "logscale" are actually synonyms right now for a boolean
  // (represented by a string, argh), but "scale" logically could refer to a
  // value selected from a list of values (which is currently limited to
  // "linear", "logscale", hence the boolean). Fix this.
  handleChangeRasterScale = this.updateLayerSimpleState.bind(this, 'raster', 'logscale');

  // React lifecycle event handlers

  componentWillReceiveProps(nextProps) {
    // TODO: This stuff, particularly loadMap, may be better placed in
    // componentWillUpdate.

    // Load initial map, based on a list of available data files passed
    // as props from its parent
    // the first dataset representing a 0th time index (January, Winter, or Annual)
    // will be displayed.

    if (hasValidData('variable', nextProps)) {
      // TODO: DRY this up
      const newVariableId = selectedVariable(nextProps.meta);
      const oldVariableId = selectedVariable(this.props.meta);
      
      var defaultDataset = nextProps.meta[0];
      var defaultInstance = _.pick(defaultDataset, 'start_date', 'end_date', 'ensemble_member');

      // check to see whether the variables displayed have been switched.
      // if so, loadMap will reset palette and logarithmic dispay.
      var switchVariable = !_.isEqual(newVariableId, oldVariableId);


      this.loadMap(nextProps, defaultInstance, switchVariable);
    } else {
      // haven't received any displayable data. Probably means user has selected
      // parameters for a dataset that isn't in the database.
      // Clear the map to prevent the previously-generated map causing confusion
      // if the user doesn't notice the footer.
      this.setState({
        variableTimes: undefined,
        variableTimeIdx: undefined,
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // This guards against re-rendering before we have required data
    // TODO: Make more efficient?
    // Currently doing deep comparison on big objects (meta).
    // Deep comparison matters on rasterRange, but not on
    // meta, which is likely a new object every time (response
    // from HTTP requests). That could be a lot faster.
    const propChange = !_.isEqual(nextProps, this.props);
    const stateChange = !_.isEqual(nextState, this.state);
    const b = propChange || stateChange;
    return b;
  }

  render() {
    return (
      this.state.raster.times ? (
        <DataMap
          raster={{
            dataset: this.getDatasetId(
              'variable', this.props.meta, this.state.raster.timeIdx),
            ...this.state.raster,
            onChangeRange: this.handleChangeRasterRange,
          }}

          onSetArea={this.props.onSetArea}
          area={this.props.area}
        >

          <StaticControl position='topleft'>
            <GeoLoader onLoadArea={this.props.onSetArea} title='Import polygon' />
          </StaticControl>

          <StaticControl position='topleft'>
            <GeoExporter area={this.props.area} title='Export polygon' />
          </StaticControl>

          <StaticControl position='topright' style={{ marginRight: '70px' }}>
            <MapSettings
              title='Map Settings'
              meta={this.props.meta}

              instance={this.currentInstance()}
              onInstanceChange={this.updateInstance}

              raster={{
                ...this.state.raster,
                onChangeTime: this.handleChangeVariableTime,
                onChangePalette: this.handleChangeRasterPalette,
                onChangeScale: this.handleChangeRasterScale,
              }}

              hasComparand={false}
              timesLinkable={false}
            />
          </StaticControl>

          <StaticControl position='bottomleft'>
            <MapFooter
              {...this.state}
              hasValidComparand={false}
            />
          </StaticControl>

        </DataMap>
      ) : (
        <Loader/>
      )
    );
  }
}

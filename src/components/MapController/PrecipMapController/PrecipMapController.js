/************************************************************************
 * PrecipMapController.js - Precipitation Map Controller
 * 
 * This controller coordinates a map with two layers, both of which are 
 * displayed with logarithmic scaling:
 * 
 *  - A climdex index rendered as a blue and white raster layer
 *  - A matching precipitation GCM output rendered as annotated isolines
 *  
 * Unlike the default MapController, both layers always display the same
 * timestamp; the precipitation is not intended for independant exploration,
 * just to provide context for the climdex layer. The user can configure
 * map settings for the climdex layer, but there's not much to configure
 * on the precipitation layer.
 *
 * Its child is Datamap, which actually renders the map.
 ************************************************************************/
// Wires up components of overall map display for CE.
// Also contains some legacy code that should be further refactored, primarily
// `loadMap` and the handling of datasets (see TODOs/FIXMEs).

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

import { timesMatch, hasValidData, 
         getRasterParamsPromise, getAnnotatedParamsPromise, 
         selectedVariable } from '../map-helpers.js';


// TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/125
export default class PrecipMapController extends React.Component {
  static propTypes = {
    meta: PropTypes.array.isRequired,
    comparandMeta: PropTypes.array,
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
        palette: 'seq-Blues',
        logscale: 'true',
        range: {},
      },

      annotated: this.props.comparandMeta ? {
        variableId: undefined, // formerly 'comparand'
        times: undefined,
        timeIdx: undefined,
        wmsTime: undefined,
        numberOfContours: 10,
        logscale: 'true',
        range: {},
      } : {},
    };
  }

  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/118
  currentInstance() {
    // Return encoding of currently selected instance
    return `${this.state.run} ${this.state.start_date}-${this.state.end_date}`;
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

  updateTime(timeIdx) {
    // update the timestamp in state for both layers
    // timeIdx is a stringified object with a resolution  (monthly, annual, seasonal)
    // and an index denoting the timestamp's position with the file
 
    // The user selects times from a list drawn from the climdex variable,
    // so the climdex variable time should be present, but it's possible precipitation
    // isn't, in which case, the annotated isolines won't show up.
    let annotatedTime = _.indexOf(_.keys(this.state.annotated.times), timeIdx) != -1 ? 
        this.state.annotated.times[timeIdx] : undefined;
    
    this.setState(prevState => ({
      raster: {
        ...prevState.raster,
        timeIdx,
        wmsTime: prevState.raster.times[timeIdx],
      },
      annotated: {
        ...prevState.annotated,
        timeIdx,
        wmsTime: annotatedTime,
      },
    }));
  }

  // Support functions for event/callback handlers

  // TODO: split loadmap into helpers?
  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/125
  loadMap(
    props,
    instance,
    newVariable = false,
  ) {
    // Update state with all the information needed to display
    // maps for the specified instance.
    // An 'instance' represents a combination of a specific variable, 
    // emissions scenario, model, period, and run. The variable, emissions, 
    // and model are selected by the user, and implicitly encoded in meta and 
    // comparandMeta, which are filtered to only relevant datasets by this 
    // component's parent.
    // The start date, end date, and run and selected by this component - either 
    // defaults or user selection - and supplied as the "instance" variable.
    // An instance may be spread across up to three data files (yearly, seasonal,
    // monthly); the specific dataset needed to map a particular timestamp is 
    // determined at render time and passed to the viewer component.

    const { start_date, end_date, ensemble_member } = instance;
    
    let rasterParamsPromise = getRasterParamsPromise(instance, props.meta);
    let annotatedParamsPromise = getAnnotatedParamsPromise(instance, props.comparandMeta);
    
    Promise.all([rasterParamsPromise, annotatedParamsPromise]).then(params => {
      
      let rasterParams = _.findWhere(params, {variableId: selectedVariable(props.meta)});
      let annotatedParams = _.findWhere(params, {variableId: selectedVariable(props.comparandMeta)});
      
      // if the variable has changed, go back to the default palette and logscale,
      // otherwise use the previous (user-selected) values in state.
      if(newVariable) {
        rasterParams.palette = 'seq-Blues';
        rasterParams.logscale = "true";
      }
      else {
        rasterParams.palette = this.state.raster.palette;
        rasterParams.logscale = this.state.raster.logscale;
      }
      
      this.setState(prevState => ({
        run: ensemble_member,
        start_date,
        end_date,
        raster: rasterParams,
        annotated: annotatedParams
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
  
  // Handlers for settings changes

  handleChangeTime = this.updateTime.bind(this);  
  handleChangeRasterPalette = this.updateLayerSimpleState.bind(this, 'raster', 'palette');

  // Handlers for layer range change

  handleChangeRasterRange = this.updateLayerSimpleState.bind(this, 'raster', 'range');
  handleChangeAnnotatedRange = this.updateLayerSimpleState.bind(this, 'annotated', 'range');

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
      const oldVariableId = this.props.meta.length > 0 ? selectedVariable(this.props.meta) : undefined;
      const hasComparand = hasValidData('comparand', nextProps);

      var defaultDataset = nextProps.meta[0];
      var defaultInstance = _.pick(defaultDataset, 'start_date', 'end_date', 'ensemble_member');

      // check to see whether the variables displayed have been switched.
      // (if so, palette and logscale will be reset)
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
        comparandTimes: undefined,
        comparandTimeIdx: undefined
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // This guards against re-rendering before we have required data
    // TODO: Make more efficient?
    // Currently doing deep comparison on big objects (meta, comparandMeta).
    // Deep comparison matters on rasterRange, annotatedRange, but not on
    // meta, comparandMeta, which are likely new objects every time (response
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

          annotated={{
            dataset: this.getDatasetId(
              'comparand', this.props.comparandMeta, this.state.annotated.timeIdx),
            ...this.state.annotated,
            onChangeRange: this.handleChangeAnnotatedRange,
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
              comparandMeta={this.props.comparandMeta}

              dataset={this.currentInstance()}
              onDatasetChange={this.updateInstance}

              raster={{
                ...this.state.raster,
                onChangeTime: this.handleChangeTime,
                onChangePalette: this.handleChangeRasterPalette,
                onChangeScale: this.handleChangeRasterScale,
              }}
              //does have a comparand, but comparand has no user-configurable params.
              hasComparand={false}
              timesLinkable={false}
            />
          </StaticControl>

          <StaticControl position='bottomleft'>
            <MapFooter
              {...this.state}
              hasValidComparand={hasValidData('comparand', this.props)}
            />
          </StaticControl>

        </DataMap>
      ) : (
        <Loader/>
      )
    );
  }
}

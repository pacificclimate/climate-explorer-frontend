/************************************************************************
 * PrecipMapController.js - Precipitation Map Controller
 * 
 * This controller coordinates a map with two layers, both of which are 
 * displayed with logarithmic scaling by default:
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
 * It is also responsible for passing user-selected areas up to its parent.
 *
 * Children: 
 *   * Datamap, which actually renders the map
 *   * MapSettings, which allows a user to configure the map
 ************************************************************************/
// Wires up components of overall map display for CE.
// Also contains some legacy code that should be further refactored, primarily
// `loadMap` and the handling of dataSpecs (see TODOs/FIXMEs).

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

import { hasValidData, currentDataSpec,
         updateLayerSimpleState, updateLayerTime,
         getDatasetId, scalarParams,
         selectRasterPalette, getTimeParametersPromise} from '../map-helpers.js';


// TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/125
export default class PrecipMapController extends React.Component {
  static propTypes = {
    variable_id: PropTypes.string.isRequired,    
    meta: PropTypes.array.isRequired,
    comparand_id: PropTypes.string.isRequired,
    comparandMeta: PropTypes.array.isRequired,
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

  // setState helper
  updateTime(timeIdx) {
    //times are selected from the raster list. annotated map will not appear if not 
    //available for the selected time.
    const annotatedIndex = _.indexOf(_.keys(this.state.annotated.times), timeIdx) != -1 ? 
        timeIdx : undefined;     
    updateLayerTime.bind(this, 'raster', timeIdx)();
    updateLayerTime.bind(this, 'annotated', annotatedIndex)();
  }

  // Support functions for event/callback handlers

  // TODO: split loadmap into helpers?
  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/125
  loadMap(
    props,
    dataSpec,
    newVariable = false,
  ) {
    // Update state with all the information needed to display
    // maps for the specified dataspec.
    // A 'dataSpec' represents a combination of a specific variable, 
    // emissions scenario, model, period, and run. The variable, emissions, 
    // and model are selected by the user in a top level component, and implicitly
    // encoded in meta and comparandMeta, which are filtered to only relevant 
    // datasets by this component's parent.
    // The start date, end date, and run and selected by this component - either 
    // defaults or user selection - and supplied as the "dataSpec" variable.
    // The data described by a dataspec may be spread across up to three data files
    // (yearly, seasonal, monthly); the specific file needed to map a particular
    // timestamp is determined at render time and passed to the viewer component.

    const { start_date, end_date, ensemble_member } = dataSpec;
    
    const rasterScalarParams = scalarParams.bind(null, props.variable_id);
    const rasterParamsPromise = getTimeParametersPromise(dataSpec, props.meta)
      .then(rasterScalarParams)
      .then(selectRasterPalette);
    
    const annotatedScalarParams = scalarParams.bind(null, props.comparand_id);
    const annotatedParamsPromise = getTimeParametersPromise(dataSpec, props.comparandMeta)
      .then(annotatedScalarParams);
    
    Promise.all([rasterParamsPromise, annotatedParamsPromise]).then(params => {
      
      let rasterParams = _.findWhere(params, {variableId: props.variable_id});
      let annotatedParams = _.findWhere(params, {variableId: props.comparand_id});
      
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

  // Handlers for dataSpec change

  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/118
  updateDataSpec = (encodedDataSpec) => {
    this.loadMap(this.props, JSON.parse(encodedDataSpec));
  };

  // Handlers for settings changes

  handleChangeTime = this.updateTime.bind(this);  
  handleChangeRasterPalette = updateLayerSimpleState.bind(this, 'raster', 'palette');

  // Handlers for layer range change

  handleChangeRasterRange = updateLayerSimpleState.bind(this, 'raster', 'range');
  handleChangeAnnotatedRange = updateLayerSimpleState.bind(this, 'annotated', 'range');

  // Handlers for scale change

  // TODO: Naming and values inherited from original code are inconsistent;
  // "scale" and "logscale" are actually synonyms right now for a boolean
  // (represented by a string, argh), but "scale" logically could refer to a
  // value selected from a list of values (which is currently limited to
  // "linear", "logscale", hence the boolean). Fix this.
  handleChangeRasterScale = updateLayerSimpleState.bind(this, 'raster', 'logscale');

  // React lifecycle event handlers

  componentWillReceiveProps(nextProps) {
    // TODO: This stuff, particularly loadMap, may be better placed in
    // componentWillUpdate.
    // Load initial map, based on a list of available data files passed
    // as props from its parent
    // the first dataset representing a 0th time index (January, Winter, or Annual)
    // will be displayed.

    if (hasValidData('variable', nextProps)) {
      const defaultDataset = nextProps.meta[0];
      const defaultDataSpec = _.pick(defaultDataset, 'start_date', 'end_date', 'ensemble_member');

      // check to see whether the variables displayed have been switched.
      // (if so, palette and logscale will be reset)
      const switchVariable = !_.isEqual(this.props.variable_id, nextProps.variable_id);
      
      this.loadMap(nextProps, defaultDataSpec, switchVariable);
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
            dataset: getDatasetId.bind(
              this, 'variable', this.props.meta, this.state.raster.timeIdx)(),
            ...this.state.raster,
            onChangeRange: this.handleChangeRasterRange,
          }}

          annotated={{
            dataset: getDatasetId.bind(
              this, 'comparand', this.props.comparandMeta, this.state.annotated.timeIdx)(),
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

              dataSpec={currentDataSpec.bind(this)()}
              onDataSpecChange={this.updateDataSpec}

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

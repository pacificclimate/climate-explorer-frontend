/*************************************************************************
 * DualMapController - displays two variables on the map at once
 * 
 * This controller coordinates a map displaying two layers at once:
 *   * A raster layer with colour shading reflecting values
 *   * A coloured isoline layer
 * 
 * The layers may display separate timestamps at once. The user may 
 * configure map layer settings including colour pallete, period and run,
 * whether colour to value mapping is logarithmic, and selected timestamp
 * on a map settings menu.
 * 
 * Props: one or two arrays of metadata describing available files
 * 
 * Children:
 *   * Datamap, which actually renders the map
 *   * MapSettings, which allows user configuration of map layers
 *************************************************************************/

// Wires up components of overall map display for CE.
// Also contains some legacy code that should be further refactored, primarily
// `loadMap` and the handling of datasets (see TODOs/FIXMEs).

import PropTypes from 'prop-types';
import React from 'react';
import Loader from 'react-loader';
import { Panel, Row, Col } from 'react-bootstrap';

import _ from 'underscore';

import '../MapController.css';
import DataMap from '../../DataMap';
import MapFooter from '../../MapFooter';
import MapSettings from '../../MapSettings';
import StaticControl from '../../StaticControl';
import GeoLoader from '../../GeoLoader';
import GeoExporter from '../../GeoExporter';

import { hasValidData, currentDataSpec,
  scalarParams, getTimeParametersPromise,
  selectRasterPalette, selectIsolinePalette,
  updateLayerSimpleState, updateLayerTime,
  getDatasetId} from '../map-helpers.js';

import styles from '../MapController.css';
import { mapPanelLabel } from '../../guidance-content/info/InformationItems';
import { MEVSummary } from '../../data-presentation/MEVSummary/MEVSummary';


// TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/125
export default class DualMapController extends React.Component {
  static propTypes = {
    variable_id: PropTypes.string.isRequired,    
    meta: PropTypes.array.isRequired,
    comparand_id: PropTypes.string,
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
        palette: 'seq-Greys',
        logscale: 'false',
        range: {},
      },

      isoline: this.props.comparandMeta ? {
        variableId: undefined, // formerly 'comparand'
        times: undefined,
        timeIdx: undefined,
        wmsTime: undefined,
        numberOfContours: 10,
        palette: 'x-Occam',
        logscale: 'false',
        range: {},
      } : {},
    };
  }

  // Support functions

  timesMatch(vTimes = this.state.raster.times, cTimes = this.state.isoline.times) {
    // Returns true if the timestamps available for the variable
    // and the timestamps available for the comparand match
    return !_.isUndefined(vTimes) &&
      !_.isUndefined(cTimes) &&
      _.isEqual(vTimes, cTimes);
  }

  // Support functions for event/callback handlers

  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/125
  loadMap(
    props,
    dataSpec,
    newVariable = false,
    newComparand = false
  ) {
    // update state with all the information needed to display
    // maps for specific dataspecs.
    // A 'dataspec' is a variable + emissions + model + period + run combination. 
    // Timestamps for an dataspec may be spread across up to three files 
    // (one annual, one seasonal, one monthly). DualMapController implicitly receives
    // the variable, emissions scenario, and model parameters via its metadata props,
    // which have been filtered on those parameters. It selects a period and run and 
    // stores them in state, but doesn't select (or store in state) a specific file with a
    // specific unique_id until rendering, when it needs to pass an exact file
    // and timestamp to the viewer component DataMap.
    // The variable and the comparand may have different available timestamps, but will
    // (aside from variable_id) display the same dataspec.

    const { start_date, end_date, ensemble_member } = dataSpec;
    
    const rasterScalarParams = scalarParams.bind(null, props.variable_id);
    const rasterParamsPromise = getTimeParametersPromise(dataSpec, props.meta)
      .then(rasterScalarParams)
      .then(selectRasterPalette);
    
    const isolineScalarParams = scalarParams.bind(null, props.comparand_id);
    const isolineParamsPromise = getTimeParametersPromise(dataSpec, props.comparandMeta)
      .then(isolineScalarParams)
      .then(selectIsolinePalette);
    
    Promise.all([rasterParamsPromise, isolineParamsPromise]).then(params => {
            
      let rasterParams = _.findWhere(params, {variableId: props.variable_id});
      let isolineParams = _.findWhere(params, {variableId: props.comparand_id});
      
      if(rasterParams === isolineParams) {
        // needed when comparand and variable are the same
        isolineParams = _.clone(rasterParams);
      }
      
      // if the variable or comparand has changed, use the default values, otherwise
      // the ones previously set by the user
      if(!newVariable) {
        rasterParams.palette = this.state.raster.palette;
        rasterParams.logscale = this.state.raster.logscale;
      }
      if(!newComparand) {
        isolineParams.palette = this.state.isoline.palette;
        isolineParams.logscale = this.state.isoline.logscale;
      }
      
      if(isolineParams.palette === 'x-Occam' && 
          rasterParams.palette === 'x-Occam') {
        rasterParams.palette = 'seq-Greys';
      }
      
      this.setState(prevState => ({
        run: ensemble_member,
        start_date,
        end_date,
        raster: rasterParams,
        isoline: isolineParams
      }));
    });  
  }

  // Handlers for dataSpec change

  // TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/118
  updateDataSpec = (encodedDataSpec) => {
    this.loadMap(this.props, JSON.parse(encodedDataSpec));
  };
  
  // Handlers for time selection change

  handleChangeVariableTime = updateLayerTime.bind(this, 'raster');
  handleChangeComparandTime = updateLayerTime.bind(this, 'isoline');

  // Handlers for palette change

  handleChangeRasterPalette = updateLayerSimpleState.bind(this, 'raster', 'palette');
  handleChangeIsolinePalette = updateLayerSimpleState.bind(this, 'isoline', 'palette');

  // Handlers for layer range change

  handleChangeRasterRange = updateLayerSimpleState.bind(this, 'raster', 'range');
  handleChangeIsolineRange = updateLayerSimpleState.bind(this, 'isoline', 'range');

  // Handlers for scale change

  // TODO: Naming and values inherited from original code are inconsistent;
  // "scale" and "logscale" are actually synonyms right now for a boolean
  // (represented by a string, argh), but "scale" logically could refer to a
  // value selected from a list of values (which is currently limited to
  // "linear", "logscale", hence the boolean). Fix this.
  handleChangeRasterScale = updateLayerSimpleState.bind(this, 'raster', 'logscale');
  handleChangeIsolineScale = updateLayerSimpleState.bind(this, 'isoline', 'logscale');

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
      // if so, logarithmic display and palettes will be reset to defaults
      const hasComparand = hasValidData('comparand', nextProps);
      const switchVariable = !_.isEqual(this.props.variable_id, nextProps.variable_id);
      const switchComparand = hasComparand && !_.isEqual(this.props.comparand_id, nextProps.comparand_id);

      this.loadMap(nextProps, defaultDataSpec, switchVariable, switchComparand);
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
    // Deep comparison matters on rasterRange, isolineRange, but not on
    // meta, comparandMeta, which are likely new objects every time (response
    // from HTTP requests). That could be a lot faster.
    const propChange = !_.isEqual(nextProps, this.props);
    const stateChange = !_.isEqual(nextState, this.state);
    const b = propChange || stateChange;
    return b;
  }

  render() {
    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title>
            <Row>
              <Col lg={2}>
                {mapPanelLabel}
              </Col>
              <Col lg={10}>
                <MEVSummary
                  className={styles.mevSummary} {...this.props} dual
                />
                {': '}
                { this.state.run }
                {' '}
                { this.state.start_date }-{ this.state.end_date }
              </Col>
            </Row>

          </Panel.Title>
        </Panel.Heading>
        <Panel.Body className={styles.mapcontroller}>
          {
            this.state.raster.times || this.state.isoline.times ? (
              <DataMap
                raster={{
                  dataset: getDatasetId.bind(
                    this, 'variable',
                    this.props.meta, this.state.raster.timeIdx
                  )(),
                  ...this.state.raster,
                  onChangeRange: this.handleChangeRasterRange,
                }}

                isoline={{
                  dataset: getDatasetId.bind(
                    this, 'comparand',
                    this.props.comparandMeta, this.state.isoline.timeIdx
                  )(),
                  ...this.state.isoline,
                  onChangeRange: this.handleChangeIsolineRange,
                }}

                onSetArea={this.props.onSetArea}
                area={this.props.area}
              >

                <StaticControl position='topleft'>
                  <GeoLoader
                    onLoadArea={this.props.onSetArea}
                    title='Import polygon'
                  />
                </StaticControl>

                <StaticControl position='topleft'>
                  <GeoExporter area={this.props.area} title='Export polygon' />
                </StaticControl>

                <StaticControl
                  position='topright'
                  style={{ marginRight: '70px' }}
                >
                  <MapSettings
                    title='Map Settings'
                    meta={this.props.meta}
                    comparandMeta={this.props.comparandMeta}

                    dataSpec={currentDataSpec.bind(this)()}
                    onDataSpecChange={this.updateDataSpec}

                    raster={{
                      ...this.state.raster,
                      onChangeTime: this.handleChangeVariableTime,
                      onChangePalette: this.handleChangeRasterPalette,
                      onChangeScale: this.handleChangeRasterScale,
                    }}

                    hasComparand={hasValidData('comparand', this.props)}
                    timesLinkable={this.timesMatch()}
                    isoline={{
                      ...this.state.isoline,
                      onChangeTime: this.handleChangeComparandTime,
                      onChangePalette: this.handleChangeIsolinePalette,
                      onChangeScale: this.handleChangeIsolineScale,
                    }}
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
          }
        </Panel.Body>
      </Panel>
    );
  }
}

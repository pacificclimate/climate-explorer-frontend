// Wires up components of overall map display for CE.
// Also contains some legacy code that should be further refactored, primarily
// `loadMap` and the handling of datasets (see TODOs/FIXMEs).

import PropTypes from 'prop-types';
import React from 'react';
import Loader from 'react-loader';

import _ from 'underscore';

import './MapController.css';
import DataMap from '../DataMap';
import MapFooter from '../MapFooter';
import MapSettings from '../MapSettings';
import StaticControl from '../StaticControl';
import GeoLoader from '../GeoLoader';
import GeoExporter from '../GeoExporter';

import { updateSingleState } from '../../core/react-utils';
import { getTimeMetadata } from '../../data-services/metadata';
import { getVariableOptions } from '../../core/util';


export default class MapController extends React.Component {
  static propTypes = {
    meta: PropTypes.array,
    comparandMeta: PropTypes.array,
    area: PropTypes.object,
    onSetArea: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      run: undefined,
      start_date: undefined,
      end_date: undefined,

      variable: undefined,
      variableTimes: undefined,
      variableTimeIdx: undefined,
      variableWmsTime: undefined,

      comparand: undefined,
      comparandTimes: undefined,
      comparandTimeIdx: undefined,
      comparandWmsTime: undefined,

      rasterLogscale: 'false',
      rasterPalette: this.props.comparandMeta ? 'seq-Greys' : 'x-Occam',

      isolineLogscale: 'false',
      isolinePalette: 'x-Occam',
      numberOfContours: 10,

      rasterRange: {},
      isolineRange: {},
    };
  }

  // Support functions
  
  hasValidData(symbol, props = this.props) {
    var dataLocation = symbol === 'variable' ? 'meta' : 'comparandMeta';

    return !_.isUndefined(props[dataLocation]) &&
      props[dataLocation].length > 0;
  }

  hasComparand() {
    return this.hasValidData('comparand');
  }

  currentDataset() {
    // Return encoding of currently selected dataset
    // FIXME: This is bad! See TODO in DatasetSelector
    return `${this.state.run} ${this.state.start_date}-${this.state.end_date}`;
    // WAAT? The below code is copied from existing MapController, but it
    // doesn't drive Selector correctly. *&*#$@*
    // return JSON.stringify({
    //   start_date: this.state.start_date,
    //   end_date: this.state.end_date,
    //   ensemble_member: this.state.run
    // });
  }

  timesMatch(vTimes = this.state.variableTimes, cTimes = this.state.comparandTimes) {
    // Returns true if the timestamps available for the variable
    // and the timestamps available for the comparand match
    return !_.isUndefined(vTimes) &&
      !_.isUndefined(cTimes) &&
      _.isEqual(vTimes, cTimes);
  }
  
  // Support functions for event/callback handlers

  loadMap(
    props,
    dataset,
    rasterPalette = this.state.rasterPalette,
    isolinePalette = this.state.isolinePalette,
    newVariable = false,
    newComparand = false
  ) {
    // update state with all the information needed to display
    // maps for specific datasets.
    // a 'dataset' in this case is not a specific file. It is a
    // variable + emissions + model + period + run combination. Timestamps for
    // a 'dataset' may be spread across up to three files (one annual, one
    // seasonal, one monthly). MapController stores the parameters of the dataset
    // in state, but doesn't select (or store in state) a specific file with a
    // specific unique_id until rendering, when it needs to pass an exact file
    // and timestamp to the viewer component CanadaMap.
    // The variable and the comparand may have  different available timestamps.

    const { start_date, end_date, ensemble_member } = dataset;

    // generate the list of available times for one or two variable+run+period combinations.
    // which may include multiple files of different time resolutions
    // (annual, seasonal, or monthly).
    let datasets = _.filter(props.meta,
      { ensemble_member, start_date, end_date });

    // if there is a comparison variable, get times from its datasets too
    if (this.hasValidData('comparand', props)) {
      datasets = datasets.concat(_.filter(props.comparandMeta,
        { ensemble_member, start_date, end_date }));
    }

    const timesPromises =
      datasets.map(ds => getTimeMetadata(ds.unique_id));

    Promise.all(timesPromises).then(responses => {
      let variableTimes = {};
      let comparandTimes = {};

      for (let i = 0; i < responses.length; i++) {
        let id = Object.keys(responses[i].data)[0];
        for (let timeidx in responses[i].data[id].times) {
          var idxString = JSON.stringify({
            timescale: responses[i].data[id].timescale,
            timeidx,
          });

          // This assumes only one variable per file.
          const variable = Object.keys(responses[i].data[id].variables)[0];
          if (variable === props.meta[0].variable_id) {
            variableTimes[idxString] = responses[i].data[id].times[timeidx];
          }
          if (this.hasValidData('comparand', props) &&
            variable === props.comparandMeta[0].variable_id
          ) {
            comparandTimes[idxString] = responses[i].data[id].times[timeidx];
          }
        }
      }

      // select a 0th index to display initially. It could be January,
      // Winter, or Annual - there's no guarentee any given dataset
      // will have monthly, seasonal, or yearly data available, but it
      // will have at least one of them.

      // Warning: Weirdness: If `===` comparison is used, the `_.find` fails.
      // TODO: Why? Fix.
      const is0thIndex = timestamp => (JSON.parse(timestamp).timeidx == 0);

      const variableStartingIndex = _.find(Object.keys(variableTimes), is0thIndex);
      const comparandStartingIndex = _.find(Object.keys(comparandTimes), is0thIndex);

      const variable = props.meta[0].variable_id;
      const comparand = this.hasValidData('comparand', props) ?
        props.comparandMeta[0].variable_id :
        undefined;

      this.setState({
        variable,
        comparand,
        run: ensemble_member,
        start_date,
        end_date,
        variableTimes,
        variableTimeIdx: variableStartingIndex,
        variableWmsTime: variableTimes[variableStartingIndex],
        comparandTimes,
        comparandTimeIdx: comparandStartingIndex,
        comparandWmsTime: comparandTimes[comparandStartingIndex],
        rasterPalette,
        isolinePalette,
        rasterLogscale: newVariable ? 'false' : this.state.rasterLogscale,
        isolineLogscale: newComparand ? 'false' : this.state.isolineLogscale,
      });
    });
  }

  // Handlers for dataset change

  updateDataset = (encodedDataset) => {
    // FIXME: This is bad! See TODO in DatasetSelector
    this.loadMap(this.props, JSON.parse(encodedDataset));
  };
  
  getDatasetId(varSymbol, varMeta, encodedVarTimeIdx) {
    let dataset = undefined;
    if (encodedVarTimeIdx) {
      if (this.hasValidData(varSymbol)) {
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
  
  getDatasetIds() {
    // const rasterDatasetID = 'tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada';
    // const isolineDatasetID = undefined;
    return {
      rasterDatasetId: this.getDatasetId(
        'variable', this.props.meta, this.state.variableTimeIdx),
      isolineDatasetId: this.getDatasetId(
        'comparand', this.props.comparandMeta, this.state.comparandTimeIdx),
    };
  }

  // Handlers for time selection change

  updateTime(symbol, timeidx) {
    // update the timestamp in state
    // timeidx is a stringified object with a resolution  (monthly, annual, seasonal)
    // and an index denoting the timestamp's position with the file
    // symbol is either 'variable' or 'comparand'
    this.setState({
      [`${symbol}TimeIdx`]: timeidx,
      [`${symbol}WmsTime`]: this.state[`${symbol}Times`][timeidx],
    });
  }

  handleChangeVariableTime = this.updateTime.bind(this, 'variable');
  handleChangeComparandTime = this.updateTime.bind(this, 'comparand');

  // Handlers for palette change

  handleChangeRasterPalette = updateSingleState.bind(this, 'rasterPalette');
  handleChangeIsolinePalette = updateSingleState.bind(this, 'isolinePalette');

  // Handlers for layer range change

  handleChangeRasterRange = updateSingleState.bind(this, 'rasterRange');
  handleChangeIsolineRange = updateSingleState.bind(this, 'isolineRange');

  // Handlers for scale change

  // TODO: Naming and values inherited from original code are inconsistent;
  // "scale" and "logscale" are actually synonyms right now for a boolean
  // (represented by a string, argh), but "scale" logically could refer to a
  // value selected from a list of values (which is currently limited to
  // "linear", "logscale", hence the boolean). Fix this.
  handleChangeRasterScale = updateSingleState.bind(this, 'rasterLogscale');
  handleChangeIsolineScale = updateSingleState.bind(this, 'isolineLogscale');

  // React lifecycle event handlers

  componentWillReceiveProps(nextProps) {
    // TODO: This stuff, particularly loadMap, may be better placed in
    // componentWillUpdate.

    // Load initial map, based on a list of available data files passed
    // as props from its parent
    // the first dataset representing a 0th time index (January, Winter, or Annual)
    // will be displayed.

    if (this.hasValidData('variable', nextProps)) {
      // TODO: DRY this up
      const newVariableId = nextProps.meta[0].variable_id;
      const oldVariableId = this.props.meta.length > 0 ? this.props.meta[0].variable_id : undefined;
      const hasComparand = nextProps.comparandMeta && nextProps.comparandMeta.length > 0;
      let newComparandId, oldComparandId;
      if (hasComparand) {
        newComparandId = nextProps.comparandMeta.length > 0 ? nextProps.comparandMeta[0].variable_id : undefined;
        oldComparandId = this.props.comparandMeta.length > 0 ? this.props.comparandMeta[0].variable_id : undefined;
      }
      var defaultDataset = nextProps.meta[0];

      // check to see whether the variables displayed have been switched.
      // if so, unset logarithmic display; default is linear.
      var switchVariable = !_.isEqual(newVariableId, oldVariableId);
      var switchComparand = hasComparand && !_.isEqual(newComparandId, oldComparandId);

      // set display colours. In order of preference:
      // 1. colours received by prop
      // 2. colours from state (set by the user or this function previously)
      // 3. colours specified in variables.yaml, if applicable (raster only)
      // 4. defaults (raster rainbow if a single dataset,
      //             raster greyscale and isolines rainbow for 2)
      var sPalette, cPalette;
      if (nextProps.rasterPalette) {
        sPalette = nextProps.rasterPalette;
        cPalette = nextProps.isolinePalette;
      } else if (this.state.rasterPalette && !switchVariable) {
        sPalette = this.state.rasterPalette;
        cPalette = this.state.isolinePalette;
      } else if (!_.isUndefined(getVariableOptions(newVariableId, 'defaultRasterPalette'))) {
        sPalette = getVariableOptions(newVariableId, 'defaultRasterPalette');
        if (this.hasValidData('comparand', nextProps)) {
          cPalette = 'x-Occam';
        }
      } else if (this.hasValidData('comparand', nextProps)) {
        sPalette = 'seq-Greys';
        cPalette = 'x-Occam';
      } else {
        sPalette = 'x-Occam';
      }

      this.loadMap(nextProps, defaultDataset, sPalette, cPalette, switchVariable, switchComparand);
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
    // console.log('MapController.shouldComponentUpdate: propChange', propChange)
    // console.log('MapController.shouldComponentUpdate: props diff', shallowDiffStr(this.props, nextProps))
    // console.log('MapController.shouldComponentUpdate: stateChange', stateChange)
    // console.log('MapController.shouldComponentUpdate: state diff', shallowDiffStr(this.state, nextState))
    return b;
  }


  render() {
    const { rasterDatasetId, isolineDatasetId } = this.getDatasetIds();

    return (
      this.state.variableTimes || this.state.comparandTimes ? (
        <DataMap
          rasterDataset={rasterDatasetId}
          rasterVariable={this.state.variable}
          rasterPalette={this.state.rasterPalette}
          rasterLogscale={this.state.rasterLogscale}
          rasterRange={this.state.rasterRange}
          onChangeRasterRange={this.handleChangeRasterRange}

          isolineDataset={isolineDatasetId}
          isolineVariable={this.state.comparand}
          isolinePalette={this.state.isolinePalette}
          numberOfContours={this.state.numberOfContours}
          isolineLogscale={this.state.isolineLogscale}
          isolineRange={this.state.isolineRange}
          onChangeIsolineRange={this.handleChangeIsolineRange}

          rasterTime={this.state.variableWmsTime}
          isolineTime={this.state.comparandWmsTime}

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

              dataset={this.currentDataset()}
              onDatasetChange={this.updateDataset}

              variableTimes={this.state.variableTimes}
              variableTimeIdx={this.state.variableTimeIdx}
              onChangeVariableTime={this.handleChangeVariableTime}

              hasComparand={this.hasComparand()}
              comparandTimes={this.state.comparandTimes}
              comparandTimeIdx={this.state.comparandTimeIdx}
              onChangeComparandTime={this.handleChangeComparandTime}

              timesLinkable={this.timesMatch()}

              rasterPalette={this.state.rasterPalette}
              onChangeRasterPalette={this.handleChangeRasterPalette}

              isolinePalette={this.state.isolinePalette}
              onChangeIsolinePalette={this.handleChangeIsolinePalette}

              rasterLayerMin={this.state.rasterRange.min}
              rasterLogscale={this.state.rasterLogscale}
              onChangeRasterScale={this.handleChangeRasterScale}

              isolineLayerMin={this.state.isolineRange.min}
              isolineLogscale={this.state.isolineLogscale}
              onChangeIsolineScale={this.handleChangeIsolineScale}
            />
          </StaticControl>

          <StaticControl position='bottomleft'>
            <MapFooter
              start_date={this.state.start_date}
              end_date={this.state.end_date}
              run={this.state.run}
              variable={this.state.variable}
              variableTimes={this.state.variableTimes}
              variableWmsTime={this.state.variableWmsTime}
              hasValidComparand={this.hasComparand()}
              comparand={this.state.comparand}
              comparandTimes={this.state.comparandTimes}
              comparandWmsTime={this.state.comparandWmsTime}
            />
          </StaticControl>

        </DataMap>
      ) : (
        <Loader/>
      )
    );
  }
}

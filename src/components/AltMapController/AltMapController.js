/* eslint-disable no-trailing-spaces */

import PropTypes from 'prop-types';
import React from 'react';
import Loader from 'react-loader';

import _ from 'underscore';

import './AltMapController.css';
import DataMap from '../DataMap';
import MapFooter from '../MapFooter';
import MapSettings from '../MapSettings';
import StaticControl from '../StaticControl';
import GeoLoader from '../GeoLoader';
import GeoExporter from '../GeoExporter';

import { getTimeMetadata } from '../../data-services/metadata';
import { getVariableOptions } from '../../core/util';


// This class is the counterpart of MapController and will ultimately become
// a drop-in replacement for it to transition over to the new architecture.

class AltMapController extends React.Component {
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
      rasterPalette: 'x-Occam',

      isolineLogscale: 'false',
      isolinePalette: undefined,
      numberOfContours: 10,
    };
  }

  // TODO: Extract to a utility module?
  hasValidData(symbol, props = this.props) {
    var dataLocation = symbol === 'variable' ? 'meta' : 'comparandMeta';

    return !_.isUndefined(props[dataLocation]) &&
      props[dataLocation].length > 0;
  }

  hasComparand() {
    return this.hasValidData('comparand');
  }

  updateLayerMinmax = () => {};

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
    // a "dataset" in this case is not a specific file. It is a
    // variable + emissions + model + period + run combination. Timestamps for
    // a "dataset" may be spread across up to three files (one annual, one
    // seasonal, one monthly). MapController stores the parameters of the dataset
    // in state, but doesn't select (or store in state) a specific file with a
    // specific unique_id until rendering, when it needs to pass an exact file
    // and timestamp to the viewer component CanadaMap.
    // The variable and the comparand may have  different available timestamps.

    // var run = dataset.ensemble_member;
    // var start_date = dataset.start_date;
    // var end_date = dataset.end_date;
    const { start_date, end_date, ensemble_member } = dataset;
    // TODO: Remove console.log
    console.log('loadMap', dataset);

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
    // for(var i = 0; i < datasets.length; i++) {
    //   timesPromises.push(this.requestTimeMetadata(datasets[i].unique_id));
    // }

    Promise.all(timesPromises).then(responses => {
      console.log('loadMap: timesPromises responses', responses)
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
      // TODO: Remove console.log
      console.log('loadMap: timesPromises variableTimes', variableTimes)
      console.log('loadMap: timesPromises comparandTimes', comparandTimes)

      // select a 0th index to display initially. It could be January,
      // Winter, or Annual - there's no guarentee any given dataset
      // will have monthly, seasonal, or yearly data available, but it
      // will have at least one of them.

      // Warning: Weirdness: If `===` comparison is used, the `_.find` fails.
      const is0thIndex = timestamp => (JSON.parse(timestamp).timeidx == 0);

      const variableStartingIndex = _.find(Object.keys(variableTimes), is0thIndex);
      const comparandStartingIndex = _.find(Object.keys(comparandTimes), is0thIndex);

      const variable = props.meta[0].variable_id;
      const comparand = this.hasValidData('comparand', props) ?
        props.comparandMeta[0].variable_id :
        undefined;

      const linkTimes = this.timesMatch(variableTimes, comparandTimes);

      // TODO: Remove console.log
      console.log('loadMap: setState', {
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
        linkTimes,
        rasterPalette,
        isolinePalette,
        rasterLogscale: newVariable ? "false" : this.state.rasterLogscale,
        isolineLogscale: newComparand ? "false" : this.state.isolineLogscale,
      })
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
        linkTimes,
        rasterPalette,
        isolinePalette,
        rasterLogscale: newVariable ? "false" : this.state.rasterLogscale,
        isolineLogscale: newComparand ? "false" : this.state.isolineLogscale,
      });
    });
  }

  // Handlers for dataset change

  updateDataset = (encodedDataset) => {
    // FIXME: This is bad! See TODO in DatasetSelector
    // const { start_date, end_date, ensemble_member } = JSON.parse(encodedDataset);
    // this.setState({ start_date, end_date, run: ensemble_member });
    console.log('updateDataset', encodedDataset);
    this.loadMap(this.props, JSON.parse(encodedDataset));
  };
  
  getDatasetId(varSymbol, varMeta, encodedVarTimeIdx) {
    console.log('getDatasetId', varSymbol, varMeta, encodedVarTimeIdx);
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
    // isolineDataset may not exist if generating a map for a
    // single-variable portal
    return dataset && dataset.unique_id;
  }
  
  getDatasetIds() {
    // const rasterDatasetID = 'tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada';
    // const isolineDatasetID = undefined;
    return {
      rasterDatasetId: this.getDatasetId('variable', this.props.meta, this.state.variableTimeIdx),
      isolineDatasetId: this.getDatasetId('comparand', this.props.comparandMeta, this.state.comparandTimeIdx),
    };
  }

  // Handlers for time selection change

  updateTime(symbol, timeidx) {
    // update the timestamp in state
    // timeidx is a stringified object with a resolution  (monthly, annual, seasonal)
    // and an index denoting the timestamp's position with the file
    // symbol is either "variable" or "comparand"
    var update = {};
    update[`${symbol}TimeIdx`] = timeidx;
    update[`${symbol}WmsTime`] = this.state[`${symbol}Times`][timeidx];

    // if the user has set the variable and comparand to match times,
    // update the comparand too
    if(this.hasValidData("comparand") &&
      this.state.linkTimes &&
      symbol == "variable") {
      update.comparandTimeIdx = timeidx;
      update.comparandWmsTime = this.state.comparandTimes[timeidx];
    }
    this.setState(update);
  }

  handleChangeVariableTime = this.updateTime.bind(this, 'variable');
  handleChangeComparandTime = this.updateTime.bind(this, 'comparand');

  // React lifecycle event handlers

  componentWillReceiveProps(nextProps) {
    // Load initial map, based on a list of available data files passed
    // as props from its parent
    // the first dataset representing a 0th time index (January, Winter, or Annual)
    // will be displayed.

    if (this.hasValidData('variable', nextProps)) {
      var newVariableId = nextProps.meta[0].variable_id;
      var oldVariableId = this.props.meta.length > 0 ? this.props.meta[0].variable_id : undefined;
      var hasComparand = nextProps.comparandMeta && nextProps.comparandMeta.length > 0;
      if (hasComparand) {
        var newComparandId = nextProps.comparandMeta.length > 0 ? nextProps.comparandMeta[0].variable_id : undefined;
        var oldComparandId = this.props.comparandMeta.length > 0 ? this.props.comparandMeta[0].variable_id : undefined;
      }
      var defaultDataset = nextProps.meta[0];
      this.layerRange = {};

      // clear stored layer value ranges.
      _.each(['raster', 'isoline'], layer => {
        this.layerRange[layer] = undefined;
      });

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
    return !_.isEqual(nextState, this.state);
  }


  render() {
    console.log('AltMapController', this.props.meta);
    const { rasterDatasetId, isolineDatasetId } = this.getDatasetIds();

    return (
      <div style={{ width: 800, height: 600 }}>
        {
          this.state.variableTimes || this.state.comparandTimes ? (
            <DataMap
              rasterLogscale={this.state.rasterLogscale}
              rasterPalette={this.state.rasterPalette}
              rasterDataset={rasterDatasetId}
              rasterVariable={this.state.variable}
              isolineLogscale={this.state.isolineLogscale}
              isolinePalette={this.state.isolinePalette}
              isolineDataset={isolineDatasetId}
              isolineVariable={this.state.comparand}
              numberOfContours={this.state.numberOfContours}
              time={this.state.variableWmsTime}
              rasterTime={this.state.variableWmsTime}
              isolineTime={this.state.comparandWmsTime}
              onSetArea={this.props.onSetArea}
              area={this.props.area}
              updateMinmax={this.updateLayerMinmax}
            >

              <StaticControl position='topleft'>
                <GeoLoader onLoadArea={this.props.onSetArea} title='Import polygon' />
              </StaticControl>

              <StaticControl position='topleft'>
                <GeoExporter.Modal area={this.props.area} title='Export polygon' />
              </StaticControl>

              <StaticControl position='topright'>
                <MapSettings
                  title='Map Settings'
                  meta={this.props.meta}
                  dataset={this.currentDataset()}
                  onDatasetChange={this.updateDataset}
                  variableTimes={this.state.variableTimes}
                  variableTimeIdx={this.state.variableTimeIdx}
                  onChangeVariableTime={this.handleChangeVariableTime}
                  hasComparand={this.hasComparand()}
                  comparandTimes={this.state.comparandTimes}
                  comparandTimeIdx={this.state.comparandTimeIdx}
                  onChangeComparandTime={this.handleChangeComparandTime}
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
                  comparandWmsTime={this.state.comparandWmsTime}
                />
              </StaticControl>

            </DataMap>
          ) : (
            <Loader/>
          )
        }
      </div>
    );
  }
}

export default AltMapController;

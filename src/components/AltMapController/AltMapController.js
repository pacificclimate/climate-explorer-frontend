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

    // Set up test state.
    this.state = {
      run: 'r1i1p1',
      start_date: '1950',
      end_date: '2100',

      variable: 'tasmax',
      variableTimes: { '{"timescale": "foo"}': '1977-07-02T00:00:00Z' },
      variableTimeIdx: '{"timescale": "foo"}', // ??
      variableWmsTime: '1977-07-02T00:00:00Z',

      comparand: undefined,
      comparandTimes: undefined,
      comparandTimeIdx: undefined,
      comparandWmsTime: undefined,

      rasterLogscale: false,
      rasterPalette: 'x-Occam',

      isolineLogscale: false,
      isolinePalette: undefined,
      numberOfContours: 10,
    };
  }

  // TODO: Extract to a utility module?
  hasValidData(symbol, props = this.props) {
    var dataLocation = symbol == "variable" ? "meta" : "comparandMeta";

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

  //returns true if the timestamps available for the variable
  //and the timestamps available for the comparand match
  timesMatch(vTimes = this.state.variableTimes, cTimes = this.state.comparandTimes) {
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

    let variableTimes = {};
    let comparandTimes = {};

    Promise.all(timesPromises).then(responses => {
      for (let i = 0; i < responses.length; i++) {
        let id = Object.keys(responses[i].data)[0];
        for (let timeidx in responses[i].data[id].times) {
          var idxString = JSON.stringify({
            timescale: responses[i].data[id].timescale,
            timeidx,
          });

          // This assumes only one variable per file.
          const variable = Object.keys(responses[i].data[id].variables)[0];
          if (variable == props.meta[0].variable_id) {
            variableTimes[idxString] = responses[i].data[id].times[timeidx];
          }
          if (this.hasValidData('comparand', props) &&
            variable == props.comparandMeta[0].variable_id
          ) {
            comparandTimes[idxString] = responses[i].data[id].times[timeidx];
          }
        }
      }

      // select a 0th index to display initially. It could be January,
      // Winter, or Annual - there's no guarentee any given dataset
      // will have monthly, seasonal, or yearly data available, but it
      // will have at least one of them.
      const is0thIndex = timestamp => JSON.parse(timestamp).timeidx == 0;

      const variableStartingIndex = _.find(Object.keys(variableTimes), is0thIndex);
      const comparandStartingIndex = _.find(Object.keys(comparandTimes), is0thIndex);

      const variable = props.meta[0].variable_id;
      const comparand = this.hasValidData('comparand', props) ?
        props.comparandMeta[0].variable_id :
        undefined;

      const linkTimes = this.timesMatch(variableTimes, comparandTimes);

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

  updateDataset = (dataset) => {
    // FIXME: This is bad! See TODO in DatasetSelector
    // const { start_date, end_date, ensemble_member } = JSON.parse(dataset);
    // this.setState({ start_date, end_date, run: ensemble_member });
    this.loadMap(this.props, JSON.parse(dataset));
  };

  render() {
    const rasterDatasetID = 'tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada';
    const isolineDatasetID = undefined;

    return (
      <div style={{ width: 800, height: 600 }}>
        {
          this.state.variableTimes || this.state.comparandTimes ? (
            <DataMap
              rasterLogscale={this.state.rasterLogscale}
              rasterPalette={this.state.rasterPalette}
              rasterDataset={rasterDatasetID}
              rasterVariable={this.state.variable}
              isolineLogscale={this.state.isolineLogscale}
              isolinePalette={this.state.isolinePalette}
              isolineDataset={isolineDatasetID}
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
                  onChangeVariableTime={() => alert('onChangeVariableTime')}
                  hasComparand={this.hasComparand()}
                  comparandTimes={this.state.comparandTimes}
                  comparandTimeIdx={this.state.comparandTimeIdx}
                  onChangeComparandTime={() => alert('onChangeComparandTime')}
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

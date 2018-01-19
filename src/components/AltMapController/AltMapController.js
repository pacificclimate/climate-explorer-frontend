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

  updateDataset = (encoding) => {
    // FIXME: This is bad! See TODO in DatasetSelector
    const { start_date, end_date, ensemble_member } = JSON.parse(encoding);
    this.setState({ start_date, end_date, run: ensemble_member });
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

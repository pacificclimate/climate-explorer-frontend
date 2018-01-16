/* eslint-disable no-trailing-spaces */
import PropTypes from 'prop-types';
import React from 'react';

import _ from 'underscore';

import './TestMapController.css';
import TestMap from '../TestMap';

// This class is the counterpart of CanadaMap
class TestMapController extends React.Component {
  constructor(props) {
    super(props);

    // Set up test state.
    this.state = {
      rasterLogscale: false,
      rasterPalette: 'x-Occam',
      variable: 'tasmax',
      isolineLogscale: false,
      isolinePalette: undefined,
      comparand: undefined,
      numberOfContours: 10,
      variableWmsTime: '1977-07-02T00:00:00Z',
      comparandWmsTime: undefined,
      area: undefined,
    };
  }


  handleSetArea = (area) => { this.setState({ area }); };

  updateLayerMinmax = () => {};

  render() {
    const rasterDatasetID = 'tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada';
    const isolineDatasetID = undefined;

    return (
      <TestMap
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
        onSetArea={this.handleSetArea}
        area={this.state.area}
        updateMinmax={this.updateLayerMinmax}
      />
    );
  }
}

export default TestMapController;

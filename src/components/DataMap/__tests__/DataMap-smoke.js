import React from 'react';
import ReactDOM from 'react-dom';
import DataMap from '../DataMap';
import { noop } from 'lodash';

describe('with single dataset (raster)', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <DataMap
        rasterDataset='tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada'
        rasterVariable='tasmax'
        rasterTime='1977-07-02T00:00:00Z'
        rasterPalette='seq-Greys'
        rasterLogscale='false'
        rasterRange={{ min: -23.34, max: 13.77 }}
        onChangeRasterRange={noop}
        onChangeIsolineRange={noop}
        onSetArea={noop}
      />,
      div
    );
  });
});

describe('with two datasets (raster, isoline)', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <DataMap
        rasterDataset='tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada'
        rasterVariable='tasmax'
        rasterTime='1977-07-02T00:00:00Z'
        rasterPalette='seq-Greys'
        rasterLogscale='false'
        rasterRange={{ min: -23.34, max: 13.77 }}
        onChangeRasterRange={noop}

        isolineDataset='tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada'
        isolineVariable='tasmax'
        isolineTime='1977-07-02T00:00:00Z'
        isolinePalette='seq-Greys'
        isolineLogscale='false'
        isolineRange={{ min: -23.34, max: 13.77 }}
        onChangeIsolineRange={noop}

        onSetArea={noop}
      />,
      div
    );
  });
});

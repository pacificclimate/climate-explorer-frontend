import React from 'react';
import ReactDOM from 'react-dom';
import DataLayer from '../DataLayer';
import { noop } from 'lodash';
import { Map } from 'react-leaflet';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const lparams = {
    dataset: 'tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada',
    variable: 'tasmax',
    time: '1977-07-02T00:00:00Z',
    palette: 'seq-Greys',
    logscale: 'false',
    range: { min: -23.34, max: 13.77 },
    onChangeRange: noop  
  };
  ReactDOM.render(
    <Map>
      <DataLayer
        layerType='raster'
        layerParams={lparams}
        onLayerRef={noop}
      />
    </Map>,
    div
  );
});

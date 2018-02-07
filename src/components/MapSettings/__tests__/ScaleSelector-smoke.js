import React from 'react';
import ReactDOM from 'react-dom';
import ScaleSelector from '../ScaleSelector';
import { noop } from 'underscore';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <ScaleSelector
      name='Raster'
      variableId='tasmax'
      layerMin={-23.34}
      value={'false'}
      onChange={noop}
    />,
    div
  );
});

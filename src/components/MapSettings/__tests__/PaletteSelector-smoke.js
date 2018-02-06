import React from 'react';
import ReactDOM from 'react-dom';
import PaletteSelector from '../PaletteSelector';
import { noop } from 'underscore';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <PaletteSelector
      name='Raster'
      value='seq-Blues'
      onChange={noop}
    />,
    div
  );
});

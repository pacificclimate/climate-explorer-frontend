import React from 'react';
import ReactDOM from 'react-dom';
import GeoExporter from '../GeoExporter';
import { noop } from 'underscore';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <GeoExporter
      onLoadArea={noop}
    />,
    div
  );
});

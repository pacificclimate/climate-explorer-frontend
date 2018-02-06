import React from 'react';
import ReactDOM from 'react-dom';
import GeoLoader from '../GeoLoader';
import { noop } from 'underscore';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <GeoLoader
      onLoadArea={noop}
    />,
    div
  );
});

import React from 'react';
import ReactDOM from 'react-dom';
import TimeSeriesGraph from '../TimeSeriesGraph';
import { noop } from 'underscore';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <TimeSeriesGraph/>,
    div
  );
});

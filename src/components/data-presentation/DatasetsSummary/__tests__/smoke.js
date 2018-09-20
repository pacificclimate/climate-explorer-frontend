import React from 'react';
import ReactDOM from 'react-dom';
import DatasetsSummary from '../DatasetsSummary';
import { noop } from 'underscore';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <DatasetsSummary/>,
    div
  );
});

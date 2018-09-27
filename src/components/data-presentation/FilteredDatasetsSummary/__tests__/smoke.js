import React from 'react';
import ReactDOM from 'react-dom';
import FilteredDatasetsSummary from '../';
import { noop } from 'underscore';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <FilteredDatasetsSummary/>,
    div
  );
});

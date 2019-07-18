import React from 'react';
import ReactDOM from 'react-dom';
import UnfilteredDatasetsSummary from '../';
import { meta } from '../../../../test_support/data';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <UnfilteredDatasetsSummary
      meta={meta}
    />,
    div
  );
});

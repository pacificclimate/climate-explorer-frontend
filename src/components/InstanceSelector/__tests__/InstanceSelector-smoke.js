import React from 'react';
import ReactDOM from 'react-dom';
import InstanceSelector from '../InstanceSelector';
import { noop } from 'underscore';
import { meta } from '../../../test_support/data';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <InstanceSelector
      meta={meta}
      value='r1i1p1 1961-1990'
      onChange={noop}
    />,
    div
  );
});

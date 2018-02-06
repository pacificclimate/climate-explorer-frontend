import React from 'react';
import ReactDOM from 'react-dom';
import TimeSelector from '../TimeSelector';
import { noop } from 'underscore';
import { times } from '../../../test_support/data';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <TimeSelector
      name='Raster'
      times={times}
      timeLinked={false}
      timeIdx={Object.keys(times)[0]}
      onChange={noop}
    />,
    div
  );
});

import React from 'react';
import ReactDOM from 'react-dom';
import MapFooter from '../MapFooter';
import { times } from '../../../test_support/data';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <MapFooter
      start_date={'start'}
      end_date={'end'}
      run={'run'}
      variable={'tasmax'}
      variableTimes={times}
      variableWmsTime={'1977-02-15T00:00:00Z'}
      hasValidComparand={false}
    />,
    div
  );
});

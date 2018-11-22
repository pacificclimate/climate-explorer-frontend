import React from 'react';
import ReactDOM from 'react-dom';
import MapFooter from '../';
import { times } from '../../../test_support/data';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <MapFooter
      start_date={'start'}
      end_date={'end'}
      run={'run'}
      raster={{
        variableId: 'tasmax',
        times,
        wmsTime: '1977-02-15T00:00:00Z',
      }}
      hasValidComparand={false}
    />,
    div
  );
});

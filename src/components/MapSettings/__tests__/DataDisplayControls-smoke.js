import React from 'react';
import ReactDOM from 'react-dom';
import DataDisplayControls from '../DataDisplayControls';
import { noop } from 'lodash';
import { times } from '../../../test_support/data';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <DataDisplayControls
      name={'Raster'}

      times={times}
      timeLinked={false}
      timeIdx={Object.keys(times)[0]}
      onChangeTime={noop}

      palette='seq-Blues'
      onChangePalette={noop}

      variableId='tasmax'
      range={{ min: -23.34 }}
      logscale={'false'}
      onChangeScale={noop}
    />,
    div
  );
});

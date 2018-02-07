import React from 'react';
import ReactDOM from 'react-dom';
import MapSettings from '../MapSettings';
import { noop } from 'underscore';
import { meta, times } from '../../../test_support/data';

describe('with one variable', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <MapSettings
        title='Map Settings'
        meta={meta}

        dataset='r1i1p1 1961-1990'
        onDatasetChange={noop}

        variableTimes={times}
        variableTimeIdx={Object.keys(times)[0]}
        onChangeVariableTime={noop}

        hasComparand={false}
        onChangeComparandTime={noop}

        rasterPalette={'seq-Blues'}
        onChangeRasterPalette={noop}

        onChangeIsolinePalette={noop}

        rasterLayerMin={-23}
        rasterLogscale={'false'}
        onChangeRasterScale={noop}

        onChangeIsolineScale={noop}

      />,
      div
    );
  });
});

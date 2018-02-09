import React from 'react';
import ReactDOM from 'react-dom';
import AnnualCycleGraph from '../AnnualCycleGraph';
import { noop } from 'underscore';
import { meta } from '../../../../test_support/data';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <AnnualCycleGraph
      meta={meta}
      dataset={{
        start_date: '1961-01-01T00:00:00Z',
        end_date: '1990-12-31T12:59:59Z',
        run: 'r1i1p1',
      }}
      onChangeDataset={noop}
      onExportXslx={noop}
      onExportCsv={noop}
    />,
    div
  );
});

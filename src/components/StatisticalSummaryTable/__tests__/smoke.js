import React from 'react';
import ReactDOM from 'react-dom';
import StatisticalSummaryTable from '../StatisticalSummaryTable';
import { noop } from 'underscore';
import { meta } from '../../../test_support/data';

jest.mock('../../../data-services/ce-backend');

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <StatisticalSummaryTable
      model_id={'GFDL-ESM2G'}
      variable_id={'tasmax'}
      experiment={'historical,rcp26'}
      meta={meta}
    />,
    div
  );
});

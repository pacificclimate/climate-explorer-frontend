//Smoke test for the WatershedSummaryTable panel
import React from 'react';
import ReactDOM from 'react-dom';
import WatershedSummaryTable from '../WatershedSummaryTable';
import { watershed_wkt} from '../../../test_support/data';

jest.mock('../../../data-services/ce-backend');

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <WatershedSummaryTable
      area={ watershed_wkt }
      ensemble_name={"upper_fraser"}
    />,
    div
  );
});

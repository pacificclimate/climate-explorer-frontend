jest.dontMock('../DataTable');
jest.dontMock('../util');

import React from 'react';
import TestUtils from 'react-addons-test-utils';

const DataTable = require('../DataTable');

const testData = {
  'tasmin_Amon_CanESM2_historical_r1i1p1_19610101-19901231':
    {
      'median': 278.34326171875,
      'min': 225.05545043945312,
      'units': 'K',
      'mean': 273.56732177734375,
      'max': 303.601318359375,
      'time': '1977-07-15T21:10:35Z',
      'ncells': 8192,
      'stdev': 22.509726901403784
    },
  'tasmin_Amon_CanESM2_historical_r1i1p1_19710101-20001231':
    {
      'median': 278.4786682128906,
      'min': 225.04750061035156,
      'units': 'K',
      'mean': 273.87298583984375,
      'max': 303.7774963378906,
      'time': '1986-07-15T21:10:35Z',
      'ncells': 8192,
      'stdev': 22.323802147796965
    }
};

describe('DataTable', function () {

  it('renders', function () {
    var table = TestUtils.renderIntoDocument(
      <DataTable />
    );
    expect(TestUtils.isCompositeComponent(table)).toBeTruthy();
  });

  it('accepts data', function () {
    var table = TestUtils.renderIntoDocument(
      <DataTable data={testData} />
    );
    expect(TestUtils.isCompositeComponent(table)).toBeTruthy();
  });

});

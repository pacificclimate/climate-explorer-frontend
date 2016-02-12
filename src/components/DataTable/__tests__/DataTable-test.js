jest.dontMock('../DataTable');
jest.dontMock('../../../core/util');

import React from 'react';
import TestUtils from 'react-addons-test-utils';

const DataTable = require('../DataTable');

const testData = [ 
  { 
    "median": 278.34326171875,
    "min": 225.05545043945312,
    "units": "K",
    "w_mean": 273.56732177734375,
    "max": 303.601318359375,
    "time": "1977-07-15T21:10:35Z",
    "ncells": 8192,
    "w_stdev": 22.509726901403784,
    "model_period": "1961 - 1990"
  },
  { 
    "median": 278.4786682128906,
    "min": 225.04750061035156,
    "units": "K",
    "w_mean": 273.87298583984375,
    "max": 303.7774963378906,
    "time": "1986-07-15T21:10:35Z",
    "ncells": 8192,
    "w_stdev": 22.323802147796965,
    "model_period": "1971 - 2000"
  }
];

describe('DataTable', function() {

  it('renders', function(){
    var table = TestUtils.renderIntoDocument(
      <DataTable data={[]} />
    );
    expect(TestUtils.isCompositeComponent(table)).toBeTruthy();
  });

  it('accepts data', function() {
    var table = TestUtils.renderIntoDocument(
      <DataTable data={testData} />
    );
    expect(TestUtils.isCompositeComponent(table)).toBeTruthy();
  });

});
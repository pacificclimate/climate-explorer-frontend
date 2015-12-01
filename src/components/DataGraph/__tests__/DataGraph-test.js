jest.dontMock('../DataGraph');
jest.dontMock('../util');

import React from 'react';
import TestUtils from 'react-addons-test-utils';

const DataGraph = require('../DataGraph');

const testData = {
    "model_id1": {
        "units": "degC",
        "2050": 21.0,
        "2080": 35.0,
        "2020": 11.0
    },
    "model_id2": {
        "units": "mm",
        "2050": 240.0,
        "2020": 300.0
    }
};

describe('DataGraph', function() {

  it('can render', function(){
    var graph = TestUtils.renderIntoDocument(
      <DataGraph />
    );
    expect(TestUtils.isCompositeComponent(graph)).toBeTruthy();
  });

  it('accepts data', function() {
    var parseC3Data = require('../util');

    var data = parseC3Data(testData);

    var graph = TestUtils.renderIntoDocument(
      <DataGraph data={data[0]} axis={data[1]} />
    );
    expect(TestUtils.isCompositeComponent(graph)).toBeTruthy();
  });

});

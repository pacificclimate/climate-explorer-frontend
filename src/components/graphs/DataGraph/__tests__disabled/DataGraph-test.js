jest.dontMock('../DataGraph');
jest.dontMock('../../../core/util');

import React from 'react';
import TestUtils from 'react-dom/test-utils';

import DataGraph from '../DataGraph';

const timeseriesTestData = {
  id: 'tasmin_Amon_CanESM2_historical_r1i1p1_19710101-20001231',
  units: 'K',
  data: {
    '1986-01-16T00:00:00Z': 275.75720932904414,
    '1986-02-15T00:00:00Z': 273.4294128417969,
    '1986-03-16T00:00:00Z': 273.4919128417969,
    '1986-04-16T00:00:00Z': 274.8638610839844,
    '1986-05-16T00:00:00Z': 276.67352294921875,
    '1986-06-16T00:00:00Z': 278.1564025878906,
    '1986-07-16T00:00:00Z': 278.5601501464844,
    '1986-08-16T00:00:00Z': 278.06195068359375,
    '1986-09-16T00:00:00Z': 276.9363098144531,
    '1986-10-16T00:00:00Z': 275.7844543457031,
    '1986-11-16T00:00:00Z': 274.8958740234375,
    '1986-12-16T00:00:00Z': 274.33758544921875,
    '1986-04-17T00:00:00Z': 273.89501953125,
    '1986-07-17T00:00:00Z': 275.0113525390625,
    '1986-10-17T00:00:00Z': 278.2606201171875,
    '1987-01-15T00:00:00Z': 275.8712158203125,
    '1986-07-02T00:00:00Z': 275.76947021484375,
  },
};

describe('DataGraph', function () {
  it('can render', function () {
    var graph = TestUtils.renderIntoDocument(
      <DataGraph />
    );
    expect(TestUtils.isCompositeComponent(graph)).toBeTruthy();
  });

  it('accepts data', function () {
    var parseDataForC3 = require('../../../../core/util').parseDataForC3;

    var data = parseDataForC3(timeseriesTestData);

    var graph = TestUtils.renderIntoDocument(
      <DataGraph data={data[0]} axis={data[1]} />
    );
    expect(TestUtils.isCompositeComponent(graph)).toBeTruthy();
  });
});

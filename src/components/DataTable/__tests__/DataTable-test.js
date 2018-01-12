jest.dontMock('../DataTable');
jest.dontMock('../../../core/util');

import React from 'react';
import TestUtils from 'react-dom/test-utils';

const DataTable = require('../DataTable');

describe('DataTable', function () {
  it('renders', function () {
    var table = TestUtils.renderIntoDocument(
      <DataTable data={[]} /import TestUtils from 'react-dom/test-utils'
    );
    expect(TestUtils.isCompositeComponent(table)).toBeTruthy();
  });
});

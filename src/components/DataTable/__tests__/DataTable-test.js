jest.dontMock('../DataTable');
jest.dontMock('../../../core/util');

import React from 'react';
import TestUtils from 'react-addons-test-utils';

const DataTable = require('../DataTable');

describe('DataTable', function () {

  it('renders', function () {
    var table = TestUtils.renderIntoDocument(
      <DataTable data={[]} />
    );
    expect(TestUtils.isCompositeComponent(table)).toBeTruthy();
  });

});

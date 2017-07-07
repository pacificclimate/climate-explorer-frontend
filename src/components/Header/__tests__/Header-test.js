jest.dontMock('../Header');
jest.dontMock('react-bootstrap');

//test commits for running jest in serial mode:
//++++++++++
//+++++++

import React from 'react';
// import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';

const Header = require('../Header');

describe('Header', function () {
  it('renders', function () {
    var header = TestUtils.renderIntoDocument(<Header />);
    expect(TestUtils.isCompositeComponent(header)).toBeTruthy();
  });
});

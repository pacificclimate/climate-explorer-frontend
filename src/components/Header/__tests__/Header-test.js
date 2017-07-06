jest.dontMock('../Header');
jest.dontMock('react-bootstrap');

//this nonsense comment was added to allow a new commit.
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

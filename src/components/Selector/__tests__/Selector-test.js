jest.dontMock('../Selector');
jest.dontMock('react-bootstrap');

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';

const Selector = require('../Selector');

describe('Selector', function() {

  it('sets the label', function() {
    var selector = TestUtils.renderIntoDocument(
      <Selector label={'New Label'} />
    );

    var labelNode = TestUtils.findRenderedDOMComponentWithTag(selector, 'label');
    expect(labelNode.textContent).toEqual('New Label');
  });

  it('sets passed items', function() {
    var selector = TestUtils.renderIntoDocument(
      <Selector items={['apple', 'banana', 'carrot']} />
    );

    var optionNodes = TestUtils.scryRenderedDOMComponentsWithTag(selector, 'option');
    var content = optionNodes.map(function(obj) {
      return obj.textContent;
    })
    expect(content).toEqual(['apple', 'banana', 'carrot']);
  });

  it('can handle "tuples"', function() {
    var selector = TestUtils.renderIntoDocument(
      <Selector items={[['Apple label', 'Apple value'], ['Banana label', 'banana_value']]} />
    );
  });

  it('calls the callback', function() {
    var dummyCallback = jest.genMockFunction();
    var selector = TestUtils.renderIntoDocument(
      <Selector onChange={dummyCallback} />
    );

    var selectorNode = TestUtils.findRenderedDOMComponentWithTag(selector, 'select');
    TestUtils.Simulate.change(selectorNode, {target: {value: "new value"}});

    expect(dummyCallback).toBeCalled();
  });

});

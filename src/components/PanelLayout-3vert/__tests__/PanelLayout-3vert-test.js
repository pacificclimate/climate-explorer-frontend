jest.dontMock('../PanelLayout-3vert');
jest.dontMock('react-bootstrap');

import React from 'react';
import TestUtils from 'react-addons-test-utils';

const Layout = require('../PanelLayout-3vert');


describe('PanelLayout-3vert', function() {
  const left = <div id={'left'}></div>;
  const right = <div id={'right'}></div>;
  const content = <div id={'content'}></div>;
  var element;

  beforeEach(function() {
    element = TestUtils.renderIntoDocument(<Layout left={left} content={content} right={right} />);
  });

  it('renders', function(){
    expect(TestUtils.isCompositeComponent(element)).toBeTruthy();
  });

  it('toggles open state on click (left)', function(){
    TestUtils.Simulate.click(
      TestUtils.findRenderedDOMComponentWithClass(
        element, 'control-toggle-left'
      )
    );
    expect(element.state.lOpen).toBeFalsy();
  });

  it('toggles open state on click (right)', function(){
    TestUtils.Simulate.click(
      TestUtils.findRenderedDOMComponentWithClass(
        element, 'control-toggle-right'
      )
    );
    expect(element.state.rOpen).toBeTruthy();
  });
});

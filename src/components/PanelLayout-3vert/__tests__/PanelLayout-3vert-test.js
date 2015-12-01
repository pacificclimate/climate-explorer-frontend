jest.dontMock('../PanelLayout-3vert');
jest.dontMock('react-bootstrap');

import React from 'react';
import TestUtils from 'react-addons-test-utils';

const Layout = require('../PanelLayout-3vert');
import styles from '../PanelLayout-3vert.css';


describe('PanelLayout-3vert', function() {
  const left = <div id={'left'}></div>;
  const right = <div id={'right'}></div>;
  const content = <div id={'content'}></div>;

  it('renders', function(){
    var element = TestUtils.renderIntoDocument(<Layout left={left} content={content} right={right} />);
    expect(TestUtils.isCompositeComponent(element)).toBeTruthy();
  });

  it('toggles open state on click (left)', function(){
    var element = TestUtils.renderIntoDocument(<Layout left={left} content={content} right={right} />);

    TestUtils.Simulate.click(
      TestUtils.findRenderedDOMComponentWithClass(
        element, 'control-toggle-left'
      )
    );
    expect(element.state.lOpen).toBeFalsy();
  });

  it('toggles open state on click (right)', function(){
    var element = TestUtils.renderIntoDocument(<Layout left={left} content={content} right={right} />);

    TestUtils.Simulate.click(
      TestUtils.findRenderedDOMComponentWithClass(
        element, 'control-toggle-right'
      )
    );
    expect(element.state.rOpen).toBeTruthy();
  });
});

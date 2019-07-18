import React from 'react';
import ReactDOM from 'react-dom';
import FlowArrow from '../FlowArrow';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <FlowArrow/>,
    div
  );
});

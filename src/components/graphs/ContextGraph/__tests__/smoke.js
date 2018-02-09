import React from 'react';
import ReactDOM from 'react-dom';
import ContextGraph from '../ContextGraph';
import { noop } from 'underscore';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <ContextGraph/>,
    div
  );
});

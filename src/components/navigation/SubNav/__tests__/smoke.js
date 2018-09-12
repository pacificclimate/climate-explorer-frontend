import React from 'react';
import ReactDOM from 'react-dom';
import SubNav from '../SubNav';
import { noop } from 'underscore';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <SubNav/>,
    div
  );
});

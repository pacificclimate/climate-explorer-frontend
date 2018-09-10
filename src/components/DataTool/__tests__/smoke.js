import React from 'react';
import ReactDOM from 'react-dom';
import DataTool from '../DataTool';
import { noop } from 'underscore';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <DataTool/>,
    div
  );
});

import React from 'react';
import ReactDOM from 'react-dom';
import ExportButtons from '../ExportButtons';
import { noop } from 'underscore';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <ExportButtons
      onExportXslx={noop}
      onExportCsv={noop}
    />,
    div
  );
});

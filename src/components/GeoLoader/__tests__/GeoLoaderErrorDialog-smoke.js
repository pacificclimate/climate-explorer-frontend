import React from 'react';
import ReactDOM from 'react-dom';
import GeoLoaderErrorDialog from '../GeoLoaderErrorDialog';
import { noop } from 'underscore';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <GeoLoaderErrorDialog
      show
      open={noop}
      close={noop}
    />,
    div
  );
});

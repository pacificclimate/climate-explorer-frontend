import React from 'react';
import ReactDOM from 'react-dom';
import GeoLoaderDialogWithError from '../GeoLoaderDialogWithError';
import { noop } from 'underscore';


it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <GeoLoaderDialogWithError
      show
      open={noop}
      close={noop}
      controls={[
        {
          show: () => true,
          open: noop,
          close: noop,
        },
      ]}
      onLoadArea={noop}
    />,
    div
  );
});

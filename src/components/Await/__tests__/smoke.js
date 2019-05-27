import React from 'react';
import ReactDOM from 'react-dom';
import Await from '../Await';
import { noop } from 'underscore';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render((
    <Await
      promises={[Promise.resolve('yup'), Promise.resolve('uh-huh')]}
    >
      <div>The awesomeness</div>
    </Await>
    ), div
  );
});

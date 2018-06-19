import React from 'react';
import ReactDOM from 'react-dom';
import VariableDescriptionSelector from '../VariableDescriptionSelector';
import { noop } from 'underscore';
import { meta } from '../../../test_support/data';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <VariableDescriptionSelector
      meta={meta}
      value={meta[0]}
      onChange={noop}
      constraints={{}}
      disabled={false}
    />,
    div
  );
});

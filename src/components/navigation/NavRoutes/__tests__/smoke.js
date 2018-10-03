import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import NavRoutes from '../';
import { noop } from 'underscore';

const navSpec = {
  basePath: '/basePath',
  items: [
    {
      label: 'Alpha',
      info: 'Alpha info',
      subPath: 'alpha',
      component: null,
    },
  ],
};

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter>
      <NavRoutes
        navSpec={navSpec}
        navIndex={0}
        onNavigate={noop}
      />
    </MemoryRouter>,
    div
  );
});

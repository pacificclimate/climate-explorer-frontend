import React from 'react';
import NavRoutes from './NavRoutes';

const navSpec = {
  basePath: '/about',
  items: [
    {
      label: 'Contact',
      subpath: 'contact',
      component: null,
    },
    {
      label: 'Credits and Acknowledgements',
      subpath: 'credits',
      component: null,
    },
    {
      label: 'Team',
      subpath: 'team',
      component: null,
    },
  ],
};

export default function About(props) {
  return <NavRoutes { ...{ navSpec, ...props } }/>;
}

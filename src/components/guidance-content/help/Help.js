import React from 'react';
import NavRoutes from '../../navigation/NavRoutes/NavRoutes';

const navSpec = {
  basePath: '/help',
  items: [
    {
      label: 'FAQ',
      subpath: 'faq',
      component: null,
    },
    {
      label: 'General',
      subpath: 'general',
      component: null,
    },
  ],
};

export default function Help(props) {
  return <NavRoutes { ...{ navSpec, ...props } }/>;
}

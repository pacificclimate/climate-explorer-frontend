import React from 'react';
import SubNav from './SubNav/SubNav';

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
  return <SubNav { ...{ navSpec, ...props } }/>;
}

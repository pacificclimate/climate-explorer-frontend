import React from 'react';
import SubNav from '../navigation/SubNav';

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

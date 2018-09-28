import React from 'react';
import NavRoutes from '../../navigation/NavRoutes/NavRoutes';
import FAQ from './FAQ';
import HelpGeneral from './HelpGeneral';
import Glossary from './Glossary';

const navSpec = {
  basePath: '/help',
  items: [
    {
      label: 'FAQ',
      subpath: 'faq',
      component: FAQ,
    },
    {
      label: 'General',
      subpath: 'general',
      component: HelpGeneral,
    },
    {
      label: 'Glossary',
      subpath: 'glossary',
      component: Glossary,
    },
  ],
};

export default function Help(props) {
  return <NavRoutes { ...{ navSpec, ...props } }/>;
}

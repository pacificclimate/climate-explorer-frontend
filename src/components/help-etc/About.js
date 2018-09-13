import React from 'react';
import NavRoutes from '../navigation/NavRoutes/NavRoutes';
import ClimateExplorer from "./ClimateExplorer";

const navSpec = {
  basePath: '/about',
  items: [
    {
      label: 'Climate Explorer',
      subpath: 'climate-explorer',
      component: ClimateExplorer,
    },
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

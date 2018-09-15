import React from 'react';
import NavRoutes from '../../navigation/NavRoutes/NavRoutes';
import ClimateExplorer from './ClimateExplorer';
import Contact from './Contact';
import Credits from './Credits';
import Team from './Team';

const navSpec = {
  basePath: '/about',
  items: [
    {
      label: 'Climate Explorer',
      subpath: 'climate-explorer',
      component: ClimateExplorer,
    },
    {
      label: 'Credits and Acknowledgements',
      subpath: 'credits',
      component: Credits,
    },
    {
      label: 'Contact',
      subpath: 'contact',
      component: Contact,
    },
    {
      label: 'Team',
      subpath: 'team',
      component: Team,
    },
  ],
};

export default function About(props) {
  return <NavRoutes { ...{ navSpec, ...props } }/>;
}

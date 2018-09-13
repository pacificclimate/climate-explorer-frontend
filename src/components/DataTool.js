import PropTypes from 'prop-types';
import React from 'react';

import NavRoutes from './navigation/NavRoutes/NavRoutes';
import SingleAppController from './app-controllers/SingleAppController/SingleAppController';
import PrecipAppController from './app-controllers/PrecipAppController/PrecipAppController';
import DualAppController from './app-controllers/DualAppController/DualAppController';

const navSpec = {
  basePath: '/data',
  items: [
    {
      label: 'Single dataset',
      info: 'View a single climate variable from a selected GCM and emission scenario.',
      subpath: 'climo/ce_files',
      render: () => <SingleAppController/>,
    },
    {
      label: 'Compare datasets',
      info: 'Simulataneously view and compare two climate variables from a selected GCM and emission scenario.',
      subpath: 'compare/ce_files',
      render: () => <DualAppController/>,
    },
    {
      label: 'Extreme Precipitation',
      info: 'View data representing extreme precipitation based on a selected GCM and emission scenario.',
      subpath: 'precipitation/extreme_precipitation',
      render: () => <PrecipAppController/>,
    },
  ],
};

export default function DataTool(props) {
  return <NavRoutes { ...{ navSpec, ...props } } />;
}

DataTool.propTypes = {
  navIndex: PropTypes.number,
  onNavigate: PropTypes.func,
};

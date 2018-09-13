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
      subpath: 'climo/ce_files',
      component: SingleAppController,
    },
    {
      label: 'Compare datasets',
      subpath: 'compare/ce_files',
      component: DualAppController,
    },
    {
      label: 'Extreme Precipitation',
      subpath: 'precipitation/extreme_precipitation',
      component: PrecipAppController,
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

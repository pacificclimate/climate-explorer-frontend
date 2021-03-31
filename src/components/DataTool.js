import PropTypes from 'prop-types';
import React from 'react';

import NavRoutes from './navigation/NavRoutes/NavRoutes';
import SingleAppController from './app-controllers/SingleAppController';
import PrecipAppController from './app-controllers/PrecipAppController';
import DualAppController from './app-controllers/DualAppController';
import FloodAppController from './app-controllers/FloodAppController';
import { loadVariableOptions } from '../core/util';
import Await from './Await';


const navSpec = {
  basePath: '/data',
  items: [
    {
      label: 'Single Variable',
      info: 'View a single climate variable from a selected GCM and emission scenario.',
      subpath: 'climo/:ensemble_name(ce_files)',
      navSubpath: 'climo/ce_files',
      render: (props) => <SingleAppController {...props} />,
    },
    {
      label: 'Compare Variables',
      info: 'Simulataneously view and compare two climate variables from a selected GCM and emission scenario.',
      subpath: 'compare/:ensemble_name(ce_files)',
      navSubpath: 'compare/ce_files',
      render: (props) => <DualAppController {...props} />,
    },
    {
      label: 'Extreme Precipitation',
      info: 'View data representing extreme precipitation based on a selected GCM and emission scenario.',
      subpath: 'precipitation/:ensemble_name(extreme_precipitation)',
      navSubpath: 'precipitation/extreme_precipitation',
      render: (props) => <PrecipAppController {...props} />,
    },
    {
      label: 'Extreme Streamflow',
      info: 'View flood frequency data for the Upper Fraser',
      subpath: 'flood/:ensemble_name(upper_fraser)',
      navSubpath: 'flood/upper_fraser',
      render: (props) => <FloodAppController {...props} />,
    },
  ],
};


export default function DataTool(props) {
  return (
    <Await
      promises={[ loadVariableOptions() ]}
      awaiting={<div>Loading external data...</div>}
    >
      <NavRoutes pullUp { ...{ navSpec, ...props } } />
    </Await>
  );
}

DataTool.propTypes = {
  navIndex: PropTypes.number,
  onNavigate: PropTypes.func,
};

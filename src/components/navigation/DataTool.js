import PropTypes from 'prop-types';
import React from 'react';

import SubNav from './SubNav/SubNav';
import SingleAppController from '../app-controllers/SingleAppController/SingleAppController';
import PrecipAppController from '../app-controllers/PrecipAppController/PrecipAppController';
import DualAppController from '../app-controllers/DualAppController/DualAppController';

import '../DataTool/DataTool.css';

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

export default class DataTool extends React.Component {
  static propTypes = {
    navIndex: PropTypes.number,
    onNavigate: PropTypes.func,
  };

  render() {
    return <SubNav { ...{ navSpec, ...this.props } } />;
  }
}

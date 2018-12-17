import PropTypes from 'prop-types';
import React from 'react';

import NavRoutes from '../navigation/NavRoutes/NavRoutes';
import SingleAppController from '../app-controllers/SingleAppController/SingleAppController';
import PrecipAppController from '../app-controllers/PrecipAppController/PrecipAppController';
import DualAppController from '../app-controllers/DualAppController/DualAppController';
import ToggleButton from '../ToggleButton';

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
  ],
};

export default class DataTool extends React.Component {

  state = {
    showDatasetsContext: false,
  };

  handleToggleSDC =
      showDatasetsContext => this.setState({ showDatasetsContext });

  render() {
    return (
      <NavRoutes
        pullUp
        { ...{ navSpec, ...this.props } }
      >
        <ToggleButton
          active={this.state.showDatasetsContext}
          onToggle={this.handleToggleSDC}
          activeMessage={'Hide datasets context'}
          inactiveMessage={'Show datasets context'}
          bsSize={'small'}
        />
      </NavRoutes>
    );
  }
}

DataTool.propTypes = {
  navIndex: PropTypes.number,
  onNavigate: PropTypes.func,
};

import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';

import NavRoutes from './navigation/NavRoutes/NavRoutes';
import SingleAppController from './app-controllers/SingleAppController/SingleAppController';
import PrecipAppController from './app-controllers/PrecipAppController/PrecipAppController';
import DualAppController from './app-controllers/DualAppController/DualAppController';
import { loadVariableOptions } from '../core/util';


function loadFakeSuccess() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('loaded');
    }, 3000);
  });
}

function loadFakeFail() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Dang!'));
    }, 3000);
  });
}

const promiseType = PropTypes.instanceOf(Promise);

class Await extends React.Component {
  static propTypes = {
    promises: PropTypes.oneOfType([
      promiseType,
      PropTypes.arrayOf(promiseType),
    ]),
    fallback: PropTypes.node,
    error: PropTypes.element,
  };

  static defaultProps = {
    fallback: <div>Waiting...</div>,
    error:  ({ error }) => {
      console.log(error)
      return <div>{error.name}: {error.message}</div>;
    },
  };

  state = {
    waiting: true,
  };

  componentWillMount() {
    const promise = _.isArray(this.props.promises) ?
      Promise.all(this.props.promises) :
      this.props.promises;
    promise.then(() => {
      this.setState({ waiting: false });
    }).catch(error => {
      this.setState({
        waiting: false,
        error
      });
    });
  }

  render() {
    if (this.state.waiting) {
      return this.props.fallback;
    }
    if (this.state.error) {
      const Error = this.props.error;
      return (
        <Error error={this.state.error} />
      );
    }
    return (
      <div>{this.props.children}</div>
    );
  }
}


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


function Patience() {
  return <div>Patience...</div>;
}

export default function DataTool(props) {
  return (
    <Await
      promises={[
        loadVariableOptions(),
        // loadFakeSuccess(),
        // loadFakeFail(),
      ]}
      fallback={<Patience/>}
    >
      <NavRoutes pullUp { ...{ navSpec, ...props } } />
    </Await>
  );
}

DataTool.propTypes = {
  navIndex: PropTypes.number,
  onNavigate: PropTypes.func,
};

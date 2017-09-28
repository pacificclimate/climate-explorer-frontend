import React from 'react';
import { render } from 'react-dom';
import { Router, Route, hashHistory } from 'react-router';

import MotiController from './components/MotiController';
import AppController from './components/AppController';
import DualController from './components/DualController';
import StreamflowController from './components/StreamflowController';

import Header from './components/Header';

var App = React.createClass({

  propTypes: {
    children: React.PropTypes.element,
  },

  render: function () {
    return (
      <div>
        <div>
          <Header />
        </div>
        <div>
          {this.props.children || <AppController ensemble_name="all_downscale_files"/>}
        </div>
      </div>
    );
  },
});

render((
  <Router history={hashHistory}>
    <Route path='/' component={App}>
      <Route path='/moti' component={MotiController} />
      <Route path='/climo/:ensemble_name' component={AppController} />
      <Route path='/compare/:ensemble_name' component={DualController} />
      <Route path='streamflow/:ensemble_name' component={StreamflowController} />
    </Route>
  </Router>
), document.getElementById('wrapper'));

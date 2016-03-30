import React from 'react';
import { render } from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';

import MotiController from './components/MotiController';
import AppController from './components/AppController';

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
          {this.props.children || <MotiController />}
        </div>
      </div>
    );
  },
});

render((
  <Router history={browserHistory}>
    <Route path='/' component={App}>
      <Route path='moti' component={MotiController} />
      <Route path='climo' component={AppController} />
    </Route>
  </Router>
), document.getElementById('wrapper'));

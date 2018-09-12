import PropTypes from 'prop-types';
import React from 'react';
import { Navbar } from 'react-bootstrap';
import { render } from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import DataTool from './components/navigation/DataTool';
import NavRoutes from './components/navigation/NavRoutes';
import Help from './components/navigation/Help';
import Science from './components/help-etc/Science';
import About from './components/navigation/About';

class App extends React.Component {
  static propTypes = {
    children: PropTypes.element,
  };

  constructor(props) {
    super(props);
    this.state = {
      navIndex: 0,
    };
  }

  handleNavigate = navIndex => {
    this.setState({ navIndex });
  };

  navSpec = {
    basePath: '',
    items: [
      {
        label: 'Home/Data',
        subpath: 'data',
        render: props =>
          <DataTool
            {...props}
            navIndex={this.state.navIndex}
            onNavigate={this.handleNavigate}
          />,
      },
      {
        label: 'Help',
        subpath: 'help',
        component: Help,
      },
      {
        label: 'Science',
        subpath: 'science',
        component: Science,
      },
      {
        label: 'About',
        subpath: 'about',
        component: About,
      },
    ],
  };

  render() {
    // We have to set Router basename with the hash (#) in it to enable
    // navigating directly into a specific route path from outside the app.
    // Not sure why this is required, but it works.
    return (
      <Router basename={'/#'}>
        <div>
          <NavRoutes navSpec={this.navSpec}>
            <Navbar.Header>
              <a href='https://pacificclimate.org/'>
                <img
                  src={require('./components/Header/logo.png')}
                  width='328'
                  height='38'
                  alt='Pacific Climate Impacts Consortium'
                />
              </a>
            </Navbar.Header>
            <Navbar.Brand>
              Climate Explorer
            </Navbar.Brand>
          </NavRoutes>
        </div>
      </Router>
    );
  }
}

render(<App/>, document.getElementById('wrapper'));

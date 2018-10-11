// App: Top-level component of the Climate Explorer app.
//
// Defines top-level navigation and routes.
//
// Controls the DataTool component (the main attraction; path `/data`)
// so that it maintains which view is selected when navigated away from.
// Other components could be similarly managed, but it was not deemed useful.
// Easy enough to do if desired.

import React from 'react';

import { Navbar } from 'react-bootstrap';
import { BrowserRouter as Router } from 'react-router-dom';

import DataTool from '../DataTool';
import NavRoutes from '../navigation/NavRoutes';
import Help from '../guidance-content/help/Help';
import Science from '../guidance-content/science/Science';
import About from '../guidance-content/about/About';

import logo from '../../assets/logo.png';
import marmot from '../../assets/marmot.png';
import css from './App.css';


export default class App extends React.Component {
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
          <NavRoutes
            navSpec={this.navSpec}
            navClassName={css.mainNav}
          >
            <Navbar.Header>
              <Navbar.Brand className={css.pcic_logo}>
                <a href='https://pacificclimate.org/'>
                  <img
                    src={logo}
                    width='328'
                    height='38'
                    alt='Pacific Climate Impacts Consortium'
                  />
                </a>
              </Navbar.Brand>
              <Navbar.Brand className={css.marmot_logo}>
                <img
                  src={marmot} height={68}
                  alt='Vancouver Island Marmot'
                  title='"The Marmot": Graphic by permission, V.I. Marmot Recovery Foundation'
                />
              </Navbar.Brand>
              <Navbar.Brand>
                Climate Explorer
              </Navbar.Brand>
            </Navbar.Header>
          </NavRoutes>
        </div>
      </Router>
    );
  }
}

import PropTypes from 'prop-types';
import React from 'react';
import { Grid, Row, Col, Navbar, Nav, NavItem } from 'react-bootstrap';
import { Route, Redirect } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';

import SingleAppController from '../app-controllers/SingleAppController';
import PrecipAppController from '../app-controllers/PrecipAppController';
import DualAppController from '../app-controllers/DualAppController';
import MotiAppController from '../app-controllers/MotiAppController';

import _ from 'underscore';

import './DataTool.css';


export default class DataTool extends React.Component {
  static propTypes = {
    defaultPath: PropTypes.string,
    onNavigate: PropTypes.func,
  };

  static navItems = [
    { path: '/data/climo/ce_files', label: 'Single dataset' },
    { path: '/data/compare/ce_files', label: 'Compare datasets' },
    { path: '/data/precipitation/extreme_precipitation', label: 'Extreme Precipitation' },
  ];

  render() {
    return (
      <Grid fluid>
        <Navbar fluid>
          <Nav
            bsStyle='pills'
            pullRight
            onSelect={this.props.onNavigate}
          >
            {
              DataTool.navItems.map(item =>
                <LinkContainer to={item.path}>
                  <NavItem eventKey={item.path}>{item.label}</NavItem>
                </LinkContainer>
              )
            }
          </Nav>
        </Navbar>
        <Row>
          <Col>
            <Route exact path='/data' render={() => (<Redirect to={this.props.defaultPath}/>)} />
            <Route path='/data/moti' component={MotiAppController} />
            <Route path='/data/climo/:ensemble_name' component={SingleAppController} />
            <Route path='/data/compare/:ensemble_name' component={DualAppController} />
            <Route path='/data/precipitation/:ensemble_name' component={PrecipAppController} />
          </Col>
        </Row>
      </Grid>
    );
  }
}

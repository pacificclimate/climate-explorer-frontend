import React, { Component } from 'react';
import { Grid, Row, Col, Nav, NavItem } from 'react-bootstrap';
import { browserHistory } from 'react-router';
import classNames from 'classnames';

import styles from './Header.css';

const Header = React.createClass({

  getInitialState() {
    return {activeKey: 1};
  },

  render() {

    const updateNav = function(key) {
        this.setState({activeKey: key})
    }.bind(this);

    const handleSelect = function(selectedKey, evt) {
        updateNav(selectedKey);
        browserHistory.push(this.href);
    };

    return (
      <div className={classNames(styles.header)}>
        <Grid fluid>
          <Row>
            <Col lg={4}>
              <a href='https://pacificclimate.org/'>
                <img
                  src={require('./logo.png')}
                  width='328'
                  height='38'
                  alt='Pacific Climate Impacts Consortium'
                />
              </a>
            </Col>
            <Col lg={8}>
              <Nav bsStyle="tabs" justified activeKey={this.state.activeKey} onSelect={handleSelect}>
                <NavItem eventKey={1} href="/climo/all_downscale_files">Standard climatologies</NavItem>
                <NavItem eventKey={2} href="/climo/all_CLIMDEX_files">ClimDEX climatologies</NavItem>
                <NavItem eventKey={3} href="/compare/all_downscale_files">Standard comparison</NavItem>
                <NavItem eventKey={4} href="/compare/all_CLIMDEX_files">ClimDEX comparison</NavItem>
              </Nav>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
});

export default Header;

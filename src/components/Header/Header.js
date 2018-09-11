import React from 'react';
import { Grid, Row, Col, Navbar, Nav, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import classNames from 'classnames';

import styles from './Header.css';

class Header extends React.Component {
  render() {
    return (
        <Navbar fluid>
          <Navbar.Header>
            <a href='https://pacificclimate.org/'>
              <img
                src={require('./logo.png')}
                width='328'
                height='38'
                alt='Pacific Climate Impacts Consortium'
              />
            </a>
          </Navbar.Header>
          <Navbar.Text>
            Climate Explorer
          </Navbar.Text>
          <Nav
            bsStyle='pills'
            pullRight
          >
            <LinkContainer to='/data'>
              <NavItem eventKey={1}>Home/Data</NavItem>
            </LinkContainer>
            <LinkContainer to='/about'>
              <NavItem eventKey={2}>About</NavItem>
            </LinkContainer>
          </Nav>
        </Navbar>
    );
  }
}

export default Header;

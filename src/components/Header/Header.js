import React from 'react';
import { Grid, Row, Col, Nav, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import classNames from 'classnames';

import styles from './Header.css';

class Header extends React.Component {
  render() {
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
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default Header;

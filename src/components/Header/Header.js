import React, { Component } from 'react';
import { Grid, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import classNames from 'classnames';

import styles from './Header.css';

class Header extends Component {

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
              <Row>
                <Link to="/climo/all_downscale_files" activeClassName="active">
                  <Button bsStyle="primary">Standard climatologies</Button>
                </Link>
                <Link to="/climo/all_CLIMDEX_files" activeClassName="active">
                  <Button bsStyle="primary">ClimDEX climatologies</Button>
                </Link>
                <Link to="/compare/all_downscale_files" activeClassName="active">
                  <Button bsStyle="primary">Standard comparision</Button>
                </Link>
                <Link to="/compare/all_CLIMDEX_files" activeClassName="active">
                  <Button bsStyle="primary">ClimDEX comparision</Button>
                </Link>
              </Row>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default Header;

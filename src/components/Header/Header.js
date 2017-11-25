import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
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
            <Col lg={4} />
            <Col lg={4}>
            <ul>
              <li><Link to="/climo/all_downscale_files">Standard climatologies</Link></li>
              <li><Link to="/climo/all_CLIMDEX_files">ClimDEX climatologies</Link></li>
              <li><Link to="/compare/all_downscale_files">Standard comparison</Link></li>
              <li><Link to="/compare/all_CLIMDEX_files">ClimDEX comparison</Link></li>
            </ul>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default Header;

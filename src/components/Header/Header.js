import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import classNames from 'classnames';

import styles from './Header.css';

class Header extends Component {

  render() {
    return (
      <div className={classNames(styles.header)}>
        <Grid fluid={true}>
          <Row>
            <Col lg={4}>
              <a className="" href="https://pacificclimate.org/">
                <img className="" src={require('./logo.png')} width="328" height="38" alt="Pacific Climate Impacts Consortium" />
              </a>
            </Col>
            <Col lg={4}>
            </Col>
            <Col lg={4}>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default Header;

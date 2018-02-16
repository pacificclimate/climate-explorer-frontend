import React, { Component } from 'react';
import createReactClass from 'create-react-class';
import { Grid, Row, Col } from 'react-bootstrap';
import classNames from 'classnames';

import styles from './Footer.css';

var Footer = createReactClass({

  render() {
    return (
      <div className={classNames(styles.footer)}>
        <Grid fluid>
          <Row>
            <Col lg={4}>
              PCIC Climate Explorer {CE_CURRENT_VERSION}
            </Col>
            <Col lg={4} />
            <Col lg={4} />
          </Row>
        </Grid>
      </div>
    );
  }
});

export default Footer;

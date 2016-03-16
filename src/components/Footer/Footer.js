import React, { Component } from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import classNames from 'classnames';

import styles from './Footer.css';

class Footer extends Component {

  render() {
    return (
      <div className={classNames(styles.footer)}>
        <Grid fluid>
          <Row>
            <Col lg={4}>
              <a className="" href="https://pacificclimate.org/">
                <img
                  className=""
                  src={require('./logo.png')}
                  width="328"
                  height="38"
                  alt="Pacific Climate Impacts Consortium"
                />
              </a>
            </Col>
            <Col lg={4} />
            <Col lg={4} />
          </Row>
        </Grid>
      </div>
    );
  }
}

export default Footer;

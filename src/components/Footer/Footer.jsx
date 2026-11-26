import React, { Component } from "react";
import createReactClass from "create-react-class";
import { Container, Row, Col } from "react-bootstrap";
import classNames from "classnames";

import styles from "./Footer.module.css";

var Footer = createReactClass({
  render() {
    return (
      <div className={classNames(styles.footer)}>
        <Container fluid>
          <Row>
            <Col xl={4}>PCIC Climate Explorer {CE_CURRENT_VERSION}</Col>
            <Col xl={4} />
            <Col xl={4} />
          </Row>
        </Container>
      </div>
    );
  },
});

export default Footer;

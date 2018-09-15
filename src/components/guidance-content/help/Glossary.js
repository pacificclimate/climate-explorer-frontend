import React from 'react';
import { Grid, Row, Col, ListGroup, ListGroupItem } from 'react-bootstrap';

import _ from 'underscore';


// Items are sorted automatically here.

const items = _.sortBy([
  <ListGroupItem header='foo'>
    foo
  </ListGroupItem>,

  <ListGroupItem header='qux'>
    qux
  </ListGroupItem>,

  <ListGroupItem header='bar'>
    bar
  </ListGroupItem>,

  <ListGroupItem header='baz'>
    baz
  </ListGroupItem>,

  <ListGroupItem header='penguin'>
    penguin
  </ListGroupItem>,

], item => item.props.header);

const half = Math.ceil(items.length / 2);
const firstItems = items.slice(0, half);
const secondItems = items.slice(half);

export default function HelpGeneral() {
  return (
    <Grid fluid>
      <h1>Glossary</h1>
      <Row>
        <Col lg={6}>
          <ListGroup>
            {firstItems}
          </ListGroup>
        </Col>
        <Col lg={6}>
          <ListGroup>
            {secondItems}
          </ListGroup>
        </Col>
      </Row>
    </Grid>
  );
}

import React from 'react';
import { Grid, Row, ListGroup, ListGroupItem } from 'react-bootstrap';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';

import _ from 'lodash';


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
      <Row>
        <FullWidthCol>
          <h1>Glossary</h1>
        </FullWidthCol>
      </Row>

      <Row>
        <HalfWidthCol>
          <ListGroup>
            {firstItems}
          </ListGroup>
        </HalfWidthCol>
        <HalfWidthCol>
          <ListGroup>
            {secondItems}
          </ListGroup>
        </HalfWidthCol>
      </Row>
    </Grid>
  );
}

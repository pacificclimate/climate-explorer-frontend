import React from "react";
import { Container, Row, ListGroup, ListGroupItem } from "react-bootstrap";
import {
  FullWidthCol,
  HalfWidthCol,
} from "../../layout/rb-derived-components.jsx";

import _ from "lodash";

// Items are sorted automatically here.

const items = _.sortBy(
  [
    <ListGroupItem key="foo">
      <h4>foo</h4>foo
    </ListGroupItem>,

    <ListGroupItem key="qux">
      <h4>qux</h4>qux
    </ListGroupItem>,

    <ListGroupItem key="bar">
      <h4>bar</h4>bar
    </ListGroupItem>,

    <ListGroupItem key="baz">
      <h4>baz</h4>baz
    </ListGroupItem>,

    <ListGroupItem key="penguin">
      <h4>penguin</h4>penguin
    </ListGroupItem>,
  ],
  (item) => item.key,
);

const half = Math.ceil(items.length / 2);
const firstItems = items.slice(0, half);
const secondItems = items.slice(half);

export default function HelpGeneral() {
  return (
    <Container fluid>
      <Row>
        <FullWidthCol>
          <h1>Glossary</h1>
        </FullWidthCol>
      </Row>

      <Row>
        <HalfWidthCol>
          <ListGroup>{firstItems}</ListGroup>
        </HalfWidthCol>
        <HalfWidthCol>
          <ListGroup>{secondItems}</ListGroup>
        </HalfWidthCol>
      </Row>
    </Container>
  );
}

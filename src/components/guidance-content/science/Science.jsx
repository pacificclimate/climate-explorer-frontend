import React from "react";
import { Container, Row } from "react-bootstrap";
import {
  FullWidthCol,
  HalfWidthCol,
} from "../../layout/rb-derived-components.jsx";
import T from "pcic-react-external-text";

export default function Science() {
  return (
    <Container fluid>
      <Row>
        <FullWidthCol>
          <T path="science.title" />
        </FullWidthCol>
      </Row>

      <Row>
        <HalfWidthCol>
          <T path="science.content" />
        </HalfWidthCol>
      </Row>
    </Container>
  );
}

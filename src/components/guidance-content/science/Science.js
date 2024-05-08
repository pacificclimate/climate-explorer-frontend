import React from "react";
import { Grid, Row } from "react-bootstrap";
import { FullWidthCol, HalfWidthCol } from "../../layout/rb-derived-components";
import T from "pcic-react-external-text";

export default function Science() {
  return (
    <Grid fluid>
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
    </Grid>
  );
}

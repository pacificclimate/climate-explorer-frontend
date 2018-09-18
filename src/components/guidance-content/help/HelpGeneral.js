import React from 'react';
import { Grid, Row } from 'react-bootstrap';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';

export default function HelpGeneral() {
  return (
    <Grid fluid>
      <Row>
        <FullWidthCol>
          <h1>Help: General</h1>
        </FullWidthCol>
      </Row>

      <Row>
        <HalfWidthCol>
          <p>Content TBD</p>
        </HalfWidthCol>
      </Row>
    </Grid>
  );
}

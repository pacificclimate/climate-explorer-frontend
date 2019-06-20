import React from 'react';
import { Grid, Row } from 'react-bootstrap';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import T from '../../../utils/external-text';

export default function Science() {
  return (
    <Grid fluid>
      <Row>
        <FullWidthCol>
          <T item='science.title' />
        </FullWidthCol>
      </Row>

      <Row>
        <HalfWidthCol>
          <T item='science.content' />
        </HalfWidthCol>
      </Row>
    </Grid>
  );
}

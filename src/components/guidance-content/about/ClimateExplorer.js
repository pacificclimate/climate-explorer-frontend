import React from 'react';
import { Grid, Row, ListGroup, ListGroupItem } from 'react-bootstrap';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import T from '../../../utils/external-text';

export default function ClimateExplorer() {
  return (
    <Grid fluid>
      <Row>
        <FullWidthCol>
          <T item='about.pcex.title' />
        </FullWidthCol>
      </Row>

      <Row>
        <HalfWidthCol>
          <ListGroup>
            <ListGroupItem header='Description'>
              <T item='about.pcex.description' />
            </ListGroupItem>

            <ListGroupItem header='Version'>
              {process.env.REACT_APP_CE_CURRENT_VERSION || 'Current version not specified'}
            </ListGroupItem>

            <ListGroupItem header='Author'>
              <T item='about.pcex.author' />
            </ListGroupItem>

            <ListGroupItem header='Terms of Use'>
              <T item='about.pcex.terms' />
            </ListGroupItem>
          </ListGroup>
        </HalfWidthCol>
      </Row>
    </Grid>
  );
}

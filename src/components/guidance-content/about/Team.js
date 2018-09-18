import React from 'react';
import { Grid, Row, ListGroup, ListGroupItem } from 'react-bootstrap';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';

export default function Team() {
  return (
    <Grid fluid>
      <Row>
        <FullWidthCol>
          <h1>Team</h1>
        </FullWidthCol>
      </Row>

      <Row>
        <HalfWidthCol>
          <ListGroup>
            <ListGroupItem
              header='James Hiebert'
              href='https://pacificclimate.org/about-pcic/people/james-hiebert'
            >
              Fearless leader.
              Ur-Architect of PCIC information systems.
              Keeper of the clan's lore and history.
            </ListGroupItem>
            <ListGroupItem
              header='Lee Zeman'
              href='https://pacificclimate.org/about-pcic/people/lee-zeman'
            >
              Front-end engineer.
              Valiant contender with GIS legacy backend rebellions.
              Implementor of wondrous data graphs.
              Champion of the practical and effective.
            </ListGroupItem>
            <ListGroupItem
              header='Rod Glover'
              href='https://pacificclimate.org/about-pcic/people/rod-glover'
            >
              Full-stack engineer.
              Implementor of fearsome data preparation tools.
              Wrangler of metadata.
              React refactorer and perfectionist.
              Migrator of databases and devotee of the alchemical arts.
            </ListGroupItem>
            <ListGroupItem
              header='Matthew Benstead'
              href='https://pacificclimate.org/about-pcic/people/matthew-benstead'
            >
              System administrator and master of all things IT.
              Docker guru.
              Restorer of fallen-over servers and failing disk arrays.
            </ListGroupItem>
          </ListGroup>
        </HalfWidthCol>
      </Row>
    </Grid>
  );
}

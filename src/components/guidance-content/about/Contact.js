import React from 'react';
import { Grid, Row, ListGroup, ListGroupItem } from 'react-bootstrap';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import { appContact } from '../info/InformationItems';

export default function HelpGeneral() {
  return (
    <Grid fluid>
      <Row>
        <FullWidthCol>
          <h1>Contact</h1>
        </FullWidthCol>
      </Row>

      <Row>
        <HalfWidthCol>
          <ListGroup>
            <ListGroupItem header='Feedback on Application'>
              Please address questions and suggestions on the functioning of
              this tool (the application proper)
              to <a href={appContact.email}>{appContact.name}</a>.
            </ListGroupItem>
            <ListGroupItem header='Scientific Questions'>
              Please address questions about science and interpretation of
              the data presented in this tool
              to <a href='#'>TBD</a>.
            </ListGroupItem>
            <ListGroupItem header='Pacific Climate Impacts Consortium'>
              See <a href='https://pacificclimate.org/contact-us'>PCIC Contact page</a>.
            </ListGroupItem>
          </ListGroup>
        </HalfWidthCol>
      </Row>
    </Grid>
  );
}

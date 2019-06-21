import React from 'react';
import { Grid, Row, ListGroup, ListGroupItem } from 'react-bootstrap';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import T from '../../../utils/external-text';

export default class HelpGeneral extends React.Component {
  static contextType = T.contextType;

  render() {
    return (
      <Grid fluid>
        <Row>
          <FullWidthCol>
            <T item='about.contact.title'/>
          </FullWidthCol>
        </Row>

        <Row>
          <HalfWidthCol>
            <ListGroup>
              <ListGroupItem
                header={T.getString(this.context, 'about.contact.feedback.header')}
              >
                <T item='about.contact.feedback.body'/>
              </ListGroupItem>
              <ListGroupItem
                header={T.getString(this.context, 'about.contact.science.header')}
              >
                <T item='about.contact.science.body'/>
              </ListGroupItem>
              <ListGroupItem
                header={T.getString(this.context, 'about.contact.pcic.header')}
              >
                <T item='about.contact.pcic.body'/>
              </ListGroupItem>
            </ListGroup>
          </HalfWidthCol>
        </Row>
      </Grid>
    );
  }
}

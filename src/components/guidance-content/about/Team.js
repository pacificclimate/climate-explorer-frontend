import React from 'react';
import { Grid, Row, ListGroup, ListGroupItem } from 'react-bootstrap';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import T from '../../../utils/external-text';

export default class Team extends React.Component {
  static contextType = T.contextType;

  render() {
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
                header={T.getString(this.context, 'about.team.james.header')}
                href={T.getString(this.context, 'about.team.james.href')}
              >
                <T item='about.team.james.body'/>
              </ListGroupItem>
              <ListGroupItem
                header={T.getString(this.context, 'about.team.lee.header')}
                href={T.getString(this.context, 'about.team.lee.href')}
              >
                <T item='about.team.lee.body'/>
              </ListGroupItem>
              <ListGroupItem
                header={T.getString(this.context, 'about.team.rod.header')}
                href={T.getString(this.context, 'about.team.rod.href')}
              >
                <T item='about.team.rod.body'/>
              </ListGroupItem>
              <ListGroupItem
                header={T.getString(this.context, 'about.team.matthew.header')}
                href={T.getString(this.context, 'about.team.matthew.href')}
              >
                <T item='about.team.matthew.body'/>
              </ListGroupItem>
            </ListGroup>
          </HalfWidthCol>
        </Row>
      </Grid>
    );
  }
}

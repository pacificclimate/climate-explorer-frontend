import React from 'react';
import { Grid, Row, ListGroup, ListGroupItem } from 'react-bootstrap';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import T from '../../../utils/external-text';
import List from '../../guidance-tools/List';

export default class ClimateExplorer extends React.Component {
  static contextType = T.contextType;

  render() {
    return (
      <Grid fluid>
        <Row>
          <FullWidthCol>
            <T path='about.pcex.title' />
          </FullWidthCol>
        </Row>

        <Row>
          <HalfWidthCol>
            <List items={
              T.get(this.context, 'about.pcex.items', { version: process.env.REACT_APP_CE_CURRENT_VERSION || 'Not specified' })
            }/>
          </HalfWidthCol>
        </Row>
      </Grid>
    );
  }
}

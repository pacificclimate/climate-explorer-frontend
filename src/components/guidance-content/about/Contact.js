import React from 'react';
import { Grid, Row } from 'react-bootstrap';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import T from 'pcic-react-external-text';
import List from '../../guidance-tools/List';

export default class HelpGeneral extends React.Component {
  static contextType = T.contextType;

  render() {
    return (
      <Grid fluid>
        <Row>
          <FullWidthCol>
            <T path='about.contact.title'/>
          </FullWidthCol>
        </Row>

        <Row>
          <HalfWidthCol>
            <List items={T.get(this.context, 'about.contact.items')}/>
          </HalfWidthCol>
        </Row>
      </Grid>
    );
  }
}

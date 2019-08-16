import React from 'react';
import { Grid, Row, ListGroup, ListGroupItem } from 'react-bootstrap';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import T from 'pcic-react-external-text';
import List from '../../guidance-tools/List';

export default class Credits extends React.Component {
  static contextType = T.contextType;

  render() {
    const sponsors = T.get(this.context, 'about.credits.sponsors.items');
    const others = T.get(this.context, 'about.credits.others.items');
    const data = T.get(this.context, 'about.credits.data.items');

    return (
      <Grid fluid>
        <Row>
          <FullWidthCol>
            <T path='about.credits.title' />
          </FullWidthCol>
        </Row>

        <Row>
          <HalfWidthCol>
            <T path='about.credits.sponsors.title'/>
            <List items={sponsors}/>

            <T path='about.credits.others.title'/>
            <List items={others}/>
          </HalfWidthCol>

          <HalfWidthCol>
            <T path='about.credits.data.title'/>
            <List items={data}/>
          </HalfWidthCol>
        </Row>

      </Grid>
    );
  }
}

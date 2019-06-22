import React from 'react';
import { Grid, Row, ListGroup, ListGroupItem } from 'react-bootstrap';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import _ from 'underscore';
import T from '../../../utils/external-text';


function Item({ header, href, body }) {
  return (
    <ListGroupItem
      header={header}
      href={href}
    >
      <T.Markdown source={body}/>
    </ListGroupItem>
  );
}

function List({ items }) {
  if (!_.isArray(items)) {
    return null;
  }
  return (
    <ListGroup>
      { items.map(item => <Item {...item}/>) }
    </ListGroup>
  );
}



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
            <T item='about.credits.title' />
          </FullWidthCol>
        </Row>

        <Row>
          <HalfWidthCol>
            <T item='about.credits.sponsors.title'/>
            <List items={sponsors}/>

            <T item='about.credits.others.title'/>
            <List items={others}/>
          </HalfWidthCol>

          <HalfWidthCol>
            <T item='about.credits.data.title'/>
            <List items={data}/>
          </HalfWidthCol>
        </Row>

      </Grid>
    );
  }
}

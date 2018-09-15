import React from 'react';
import { Grid, ListGroup, ListGroupItem } from 'react-bootstrap';

import _ from 'underscore';


// Items are sorted automatically here.

const items = _.sortBy([
  <ListGroupItem header='foo'>
    foo
  </ListGroupItem>,

  <ListGroupItem header='bar'>
    bar
  </ListGroupItem>,

], item => item.props.header);

export default function HelpGeneral() {
  return (
    <Grid fluid>
      <h1>Glossary</h1>
      <ListGroup>
        {items}
      </ListGroup>
    </Grid>
  );
}

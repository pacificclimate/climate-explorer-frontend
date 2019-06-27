import React from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import T from '../../utils/external-text';
import _ from 'underscore';

export function Item({ header, href, body }) {
  return (
    <ListGroupItem
      header={header}
      href={href}
    >
      <T.Markdown source={body}/>
    </ListGroupItem>
  );
}

export default function List({ items }) {
  if (!_.isArray(items)) {
    return null;
  }
  return (
    <ListGroup>
      { items.map(item => <Item {...item}/>) }
    </ListGroup>
  );
}

List.Item = Item;
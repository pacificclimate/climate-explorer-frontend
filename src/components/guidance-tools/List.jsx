import React from "react";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import T from "pcic-react-external-text";
import _ from "lodash";

export function Item({ header, href, body }) {
  return (
    <ListGroupItem href={href}>
      {header && <h4>{header}</h4>}
      <T.Markdown source={body} />
    </ListGroupItem>
  );
}

export default function List({ items }) {
  if (!_.isArray(items)) {
    return null;
  }
  return (
    <ListGroup>
      {items.map((item, index) => (
        <Item key={item.href || index} {...item} />
      ))}
    </ListGroup>
  );
}

List.Item = Item;

import Icon from "../Icon/Icon";
import React from "react";
import { Button } from "react-bootstrap";

// TODO: Make into a PureComponent
export default function (props) {
  return (
    <Button variant="light" onClick={props.open} title={props.title} size="sm">
      <Icon glyph="menu-hamburger" />
    </Button>
  );
}

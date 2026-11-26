import Icon from "../Icon/Icon";
import React from "react";
import { Button } from "react-bootstrap";

export default function GeoloaderButton(props) {
  return (
    <Button variant="light" size="sm" onClick={props.open} title={props.title}>
      <Icon glyph="open-file" />
    </Button>
  );
}

import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';


// TODO: Make into a PureComponent
export default function (props) {
  return (
    <Button onClick={props.open} title={props.title}>
      <Glyphicon glyph='menu-hamburger'/>
    </Button>
  );
}

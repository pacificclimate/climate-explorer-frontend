import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';


export default function (props) {
  return (
    <Button bsSize='small' onClick={props.open} title={props.title}>
      <Glyphicon glyph='save-file'/>
    </Button>
  );
}

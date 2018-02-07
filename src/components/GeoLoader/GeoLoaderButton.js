import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';


export default function GeoloaderButton(props) {
  return (
    <Button onClick={props.open} title={props.title}>
      <Glyphicon glyph='open-file'/>
    </Button>
  );
}

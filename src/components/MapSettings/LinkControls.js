import PropTypes from 'prop-types';
import React from 'react';
import { Button, Glyphicon, } from 'react-bootstrap';

import _ from 'underscore';


export default class LinkControls extends React.Component {
  static propTypes = {
  };

  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    return (
      <Button><Glyphicon glyph='transfer' /></Button>
    );
  }
}

import PropTypes from 'prop-types';
import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';


export default class LinkControls extends React.Component {
  static propTypes = {
    active: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
  };

  static defaultProps = {
    active: false,
  };

  render() {
    return (
      <Button {...this.props}>
        <Glyphicon glyph='transfer' />
      </Button>
    );
  }
}

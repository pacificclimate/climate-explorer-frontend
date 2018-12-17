import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'react-bootstrap';

import _ from 'underscore';

import './ToggleButton.css';


export default class ToggleButton extends React.Component {
  static propTypes = {
    active: PropTypes.bool.isRequired,
    activeMessage: PropTypes.string.isRequired,
    inactiveMessage: PropTypes.string.isRequired,
    onToggle: PropTypes.func.isRequired,
  };

  toggleActive = () => this.props.onToggle(!this.props.active);

  render() {
    const { active, activeMessage, inactiveMessage, onToggle, ...rest } =
      this.props;
    return (
      <Button onClick={this.toggleActive} {...rest}>
        {active ? activeMessage : inactiveMessage}
      </Button>
    );
  }
}

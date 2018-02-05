// Button with tooltip for linking/unlinking time selectors in MapSettings.

import PropTypes from 'prop-types';
import React from 'react';
import { Button, Glyphicon, OverlayTrigger, Tooltip } from 'react-bootstrap';


export default class LinkControls extends React.PureComponent {
  static propTypes = {
    timesLinkable: PropTypes.bool,
    linkTimes: PropTypes.bool,
    onClick: PropTypes.func.isRequired,
  };

  tooltipContent() {
    if (!this.props.timesLinkable) {
      return 'Available timestamps in data do not match';
    } else if (this.props.linkTimes) {
      return 'Deactivate timestamp matching';
    } else {
      return 'Activate timestamp matching';
    }
  }

  tooltip = () => <Tooltip>{this.tooltipContent()}</Tooltip>;

  render() {
    return (
      <OverlayTrigger placement='bottom' overlay={this.tooltip()}>
        <Button
          disabled={!this.props.timesLinkable}
          active={this.props.linkTimes}
          onClick={this.props.onClick}
        >
          <Glyphicon glyph='transfer' />
        </Button>
      </OverlayTrigger>
    );
  }
}

import PropTypes from 'prop-types';
import React from 'react';
import { Glyphicon, Popover, OverlayTrigger } from 'react-bootstrap';

import styles from './Information.css';

let idNum = 0;

function nextPopoverId() {
  return `info-popover-${idNum++}`;
}

export default function Information(
  { glyph, placement, delayHide, children }
) {
  return (
    <OverlayTrigger
      trigger='hover'
      delayHide={delayHide}
      placement={placement}
      overlay={
        <Popover id={nextPopoverId()}>{children}</Popover>
      }
    >
      <Glyphicon glyph={glyph} className={styles.icon}/>
    </OverlayTrigger>
  );
}

Information.propTypes = {
  glyph: PropTypes.string,
  placement: PropTypes.string,
  delayHide: PropTypes.number,
  children: PropTypes.any,
};

Information.defaultProps = {
  glyph: 'info-sign',
  placement: 'bottom',
  delayHide: 1000,
};

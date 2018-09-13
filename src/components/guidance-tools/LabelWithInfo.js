import PropTypes from 'prop-types';
import React from 'react';
import Information from './Information/Information';

export default function LabelWithInfo({ label, children }) {
  return (
    <span>
      { label }
      { children && <Information>{children}</Information> }
    </span>
  );
}

LabelWithInfo.propTypes = {
  label: PropTypes.string,  // label
  children: PropTypes.node, // content for Information for this item
};

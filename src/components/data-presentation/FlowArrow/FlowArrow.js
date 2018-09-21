import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';

import css from './FlowArrow.css';


const FlowArrow = ({ pullUp }) => (
  <div className={classnames(
      css.flowArrow, { [css.pullUp]: pullUp }, 'text-center'
    )}
  >
      <span className={css.icon}>{'⇣'}</span>
  </div>
);

FlowArrow.propTypes = {
  pullUp: PropTypes.bool.isRequired,
};

FlowArrow.defaultProps = {
  pullUp: false,
};

export default FlowArrow;

import PropTypes from "prop-types";
import React from "react";
import classnames from "classnames";

import css from "./FlowArrow.module.css";

const FlowArrow = ({ pullUp, children }) => (
  <div
    className={classnames(
      css.flowArrow,
      { [css.pullUp]: pullUp },
      "text-center",
    )}
  >
    {children}
    <span className={css.icon}>{"⇣"}</span>
  </div>
);

FlowArrow.propTypes = {
  pullUp: PropTypes.bool.isRequired,
  children: PropTypes.node,
};

FlowArrow.defaultProps = {
  pullUp: false,
};

export default FlowArrow;

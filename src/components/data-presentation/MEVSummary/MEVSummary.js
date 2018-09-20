import React from 'react';
import PropTypes from 'prop-types';


export const MEVSummary = (
  { model_id, experiment, variable_id, comparand_id, dual }
) =>
  (
    <span>
      {`${model_id} ${experiment}: ${variable_id} `}
      {
        dual ?
          (variable_id === comparand_id ?
            ' only' :
            ` vs ${comparand_id}`) :
          ''
      }
  </span>
);

MEVSummary.propTypes = {
  model_id: PropTypes.string.isRequired,
  experiment: PropTypes.string.isRequired,
  variable_id: PropTypes.string,
  dual: PropTypes.bool.isRequired,
};

MEVSummary.defaultProps = {
  dual: false,
};

export const DualMEVSummary = (props) =>
  <MEVSummary {...props} dual />;

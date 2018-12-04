import React from 'react';
import PropTypes from 'prop-types';


export function MEVSummary(
  { model_id, experiment, variable_id, comparand_id, dual }
) {
  // When the props for this component don't have useful values,
  // we want to display a less obnoxious result.
  // The following test is minimal and sufficient for this condition.
  if (!model_id) {
    return <span>Loading...</span>;
  }
  return (
    <span>
      {`${model_id} ${experiment}: ${variable_id} `}
      {
        dual ?
          (variable_id === comparand_id ?
            ' only' :
            ` & ${comparand_id}`) :
          ''
      }
    </span>
  );
}

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
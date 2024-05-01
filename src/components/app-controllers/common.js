// This module provides functions common to several app controllers.

// Get the ensemble name from props (as passed to an app controller),
// falling back to the env variable REACT_APP_CE_ENSEMBLE_NAME if not found.
export const ensemble_name = (props) =>
  (props.match && props.match.params && props.match.params.ensemble_name) ||
  props.ensemble_name ||
  process.env.REACT_APP_CE_ENSEMBLE_NAME;

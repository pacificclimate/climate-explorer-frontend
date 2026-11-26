// This module provides functions common to several app controllers.

// Get the ensemble name passed by the route to an app controller,
// falling back to the env variable REACT_APP_CE_ENSEMBLE_NAME if not found.
export const ensemble_name = (props) =>
  props.ensemble_name || window.env.REACT_APP_CE_ENSEMBLE_NAME;

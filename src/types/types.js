/*****************************************************************************
 * types/types.js - provides PropType declarations for props used by multiple
 * components.
 *****************************************************************************/
import PropTypes from "prop-types";

//layerParams - parameters specifying an ncWMS map layer
//used by DataMap and DataLayer
const layerParamsPropTypes = PropTypes.shape({
  dataset: PropTypes.string,
  filepath: PropTypes.string,
  variableId: PropTypes.string,
  time: PropTypes.string,
  defaultOpacity: PropTypes.number,
  palette: PropTypes.string,
  logscale: PropTypes.string,
  range: PropTypes.object,
  onChangeRange: PropTypes.func.isRequired,
});

export { layerParamsPropTypes };

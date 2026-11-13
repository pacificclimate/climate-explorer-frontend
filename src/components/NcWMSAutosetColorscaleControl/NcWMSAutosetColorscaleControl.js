import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

import LeafletNcWMSAutosetColorscaleControl from "./LeafletNcWMSAutosetColorscaleControl";

// TODO: https://github.com/pacificclimate/climate-explorer-frontend/issues/123
// Attach and update the imperative control through React-Leaflet 4's map context.
function NcWMSAutosetColorscaleControl(props) {
  const map = useMap();
  const controlRef = useRef(null);

  useEffect(() => {
    const control = new LeafletNcWMSAutosetColorscaleControl(props);
    controlRef.current = control;
    map.addControl(control);
    return () => {
      map.removeControl(control);
      controlRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    controlRef.current?.update(props);
  }, [props]);

  return null;
}

export default NcWMSAutosetColorscaleControl;

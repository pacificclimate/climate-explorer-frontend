import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMap } from "react-leaflet";
import L from "leaflet";

import "./StaticControl.css";

// A portal preserves the application's React context inside the Leaflet control.
function StaticControl({ position, style = {}, children }) {
  const map = useMap();
  const [container, setContainer] = useState(null);

  useEffect(() => {
    const control = L.control({ position });
    control.onAdd = () => {
      const element = L.DomUtil.create("div", "StaticControl leaflet-control");
      L.DomEvent.disableClickPropagation(element);
      L.DomEvent.disableScrollPropagation(element);
      setContainer(element);
      return element;
    };
    map.addControl(control);
    return () => map.removeControl(control);
  }, [map, position]);

  useEffect(() => {
    if (!container) return;
    Object.assign(container.style, style);
    return () => {
      for (const key of Object.keys(style)) container.style[key] = "";
    };
  }, [container, style]);

  return container ? createPortal(children, container) : null;
}

export default StaticControl;

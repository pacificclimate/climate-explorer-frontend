import { useEffect, useRef } from "react";
import L from "../../core/leaflet";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";

// Only user selections participate in editing/removal, not other map layers.
L.PM.setOptIn(true);

// Accept a native map so this control does not depend on a React-Leaflet version.
export default function GeomanControl({
  map,
  layers,
  pointSelect,
  protectBoundary,
  shapeStyle,
  onCreate,
  onEdit,
  onRemove,
}) {
  const callbacks = useRef({});
  callbacks.current = { onCreate, onEdit, onRemove };
  const selection = useRef(null);

  useEffect(() => {
    if (!map) return;
    const group = L.featureGroup().addTo(map);
    const managed = new Set();
    const edited = () => callbacks.current.onEdit();
    selection.current = { group, managed, edited };
    map.pm.setGlobalOptions({
      layerGroup: group,
      snappable: false,
      continueDrawing: false,
      markerEditable: false,
      resizeableCircleMarker: false,
    });

    const created = ({ layer }) => {
      group.addLayer(layer);
      managed.add(layer);
      layer.on("pm:edit", edited);
      callbacks.current.onCreate(layer);
    };
    const removed = ({ layer }) => {
      if (!managed.has(layer)) return;
      managed.delete(layer);
      layer.off("pm:edit", edited);
      group.removeLayer(layer);
      callbacks.current.onRemove([layer]);
    };
    map.on("pm:create", created);
    map.on("pm:remove", removed);
    map.pm.Toolbar.changeActionsOfControl("removalMode", [
      "finishMode",
      {
        name: "clearAll",
        text: "Clear all",
        onClick: () => {
          const removedLayers = group.getLayers();
          group.clearLayers();
          map.pm.disableGlobalRemovalMode();
          callbacks.current.onRemove(removedLayers);
        },
      },
    ]);

    return () => {
      map.off("pm:create", created);
      map.off("pm:remove", removed);
      map.pm.disableDraw();
      map.pm.disableGlobalEditMode();
      map.pm.disableGlobalRemovalMode();
      map.pm.removeControls();
      managed.forEach((layer) => layer.off("pm:edit", edited));
      group.remove();
      selection.current = null;
    };
  }, [map]);

  useEffect(() => {
    if (!selection.current) return;
    const { group, managed, edited } = selection.current;
    managed.forEach((layer) => {
      if (!layers.includes(layer)) {
        layer.off("pm:edit", edited);
        group.removeLayer(layer);
        managed.delete(layer);
      }
    });
    layers.forEach((layer, index) => {
      // The upstream watershed boundary is derived from the selected outlet.
      const protectedLayer = protectBoundary && index > 0;
      layer.options.pmIgnore = protectedLayer;
      if (!protectedLayer && !layer.pm) L.PM.reInitLayer(layer);
      layer.pm?.setOptions({
        allowEditing: !protectBoundary,
        allowRemoval: !protectedLayer,
        draggable: false,
      });
      if (!managed.has(layer)) {
        managed.add(layer);
        layer.on("pm:edit", edited);
      }
      if (!group.hasLayer(layer)) group.addLayer(layer);
    });
  }, [map, layers, protectBoundary]);

  const hasSelection = layers.length > 0;
  useEffect(() => {
    if (!map) return;
    if (hasSelection) map.pm.disableDraw();
    else {
      map.pm.disableGlobalEditMode();
      map.pm.disableGlobalRemovalMode();
    }
    map.pm.addControls({
      position: "topleft",
      drawMarker: false,
      drawCircleMarker: pointSelect && !hasSelection,
      drawPolyline: false,
      drawRectangle: !pointSelect && !hasSelection,
      drawPolygon: !pointSelect && !hasSelection,
      drawCircle: false,
      drawText: false,
      editMode: !protectBoundary && hasSelection,
      dragMode: false,
      cutPolygon: false,
      removalMode: hasSelection,
      rotateMode: false,
    });
  }, [map, pointSelect, hasSelection, protectBoundary]);

  useEffect(() => {
    if (map) map.pm.setPathOptions(shapeStyle);
  }, [map, shapeStyle]);

  return null;
}

import React from "react";
import { MapContainer } from "react-leaflet";
import { render } from "../../../test_support/render";
import DataLayer from "../DataLayer";

it.each([
  ["raster", "default-scalar/seq-Blues"],
  ["isoline", "colored_contours/seq-Blues"],
  ["annotated", "contours"],
])(
  "updates %s WMS selection, appearance and opacity",
  (layerType, expectedStyle) => {
    let layer;
    const layerRef = (value) => {
      layer = value;
    };
    const params = {
      dataset: "first-dataset",
      filepath: "first.nc",
      variableId: "tasmax",
      wmsTime: "1977-07-02T00:00:00Z",
      palette: "seq-Greys",
      logscale: "true",
      range: { min: 1, max: 10 },
      opacity: 0.7,
    };
    const view = (layerParams) => (
      <MapContainer center={[60, -100]} zoom={1}>
        <DataLayer
          layerType={layerType}
          layerParams={layerParams}
          onLayerRef={layerRef}
        />
      </MapContainer>
    );
    const container = render(view(params));
    const originalLayer = layer;
    expect(layer.wmsParams.time).toBe(params.wmsTime);
    expect(layer.options.opacity).toBe(0.7);

    render(
      view({
        ...params,
        dataset: "second-dataset",
        filepath: "second.nc",
        variableId: "pr",
        wmsTime: "1980-01-01T00:00:00Z",
        palette: "seq-Blues",
        range: { min: 2, max: 20 },
        opacity: 0.3,
      }),
      container,
    );
    expect(layer).toBe(originalLayer);
    expect(layer.wmsParams.layers).toContain("second.nc/pr");
    expect(layer.wmsParams).toMatchObject({
      time: "1980-01-01T00:00:00Z",
      styles: expectedStyle,
      colorscalerange: "2,20",
    });
    expect(layer.options.opacity).toBe(0.3);
  },
);

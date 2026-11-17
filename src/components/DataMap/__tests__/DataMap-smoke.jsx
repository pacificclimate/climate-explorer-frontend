import React from "react";
import ReactDOM from "react-dom";
import { Map as ReactLeafletMap } from "react-leaflet";
import DataMap from "../DataMap.jsx";
import { noop } from "lodash";

// Temporary React-Leaflet 2 compatibility shim. Its draw UMD build creates a
// second Leaflet instance in jsdom; remove this when upgrading React-Leaflet.
vi.mock("react-leaflet-draw", () => ({ EditControl: () => null }));

// Temporary React-Leaflet 2/jsdom workaround. The legacy bounds update path
// assumes both renders provide bounds. Revisit/remove with the React 18 and
// React-Leaflet upgrade.
const shouldUpdateBounds = ReactLeafletMap.prototype.shouldUpdateBounds;
ReactLeafletMap.prototype.shouldUpdateBounds = function (nextProps, props) {
  if (!nextProps.bounds || !props.bounds) return false;
  return shouldUpdateBounds.call(this, nextProps, props);
};

describe("with single dataset (raster)", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <DataMap
        rasterDataset="tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada"
        rasterVariable="tasmax"
        rasterTime="1977-07-02T00:00:00Z"
        rasterPalette="seq-Greys"
        rasterLogscale="false"
        rasterRange={{ min: -23.34, max: 13.77 }}
        onChangeRasterRange={noop}
        onChangeIsolineRange={noop}
        onSetArea={noop}
      />,
      div,
    );
  });
});

describe("with two datasets (raster, isoline)", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <DataMap
        rasterDataset="tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada"
        rasterVariable="tasmax"
        rasterTime="1977-07-02T00:00:00Z"
        rasterPalette="seq-Greys"
        rasterLogscale="false"
        rasterRange={{ min: -23.34, max: 13.77 }}
        onChangeRasterRange={noop}
        isolineDataset="tasmax_aClim_BCCAQv2_GFDL-ESM2G_historical-rcp26_r1i1p1_19610101-19901231_Canada"
        isolineVariable="tasmax"
        isolineTime="1977-07-02T00:00:00Z"
        isolinePalette="seq-Greys"
        isolineLogscale="false"
        isolineRange={{ min: -23.34, max: 13.77 }}
        onChangeIsolineRange={noop}
        onSetArea={noop}
      />,
      div,
    );
  });
});

import React from "react";
import ReactDOM from "react-dom";
import { Map } from "react-leaflet";
import LayerControlledFeatureGroup from "../LayerControlledFeatureGroup.js";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <Map>
      <LayerControlledFeatureGroup />
    </Map>,
    div,
  );
});

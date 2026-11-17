import React from "react";
import { render } from "../../../test_support/render";
import ScaleSelector from "../ColourMapTypeSelector";
import { noop } from "lodash";

it("renders without crashing", () => {
  const div = document.createElement("div");
  render(
    <ScaleSelector
      name="Raster"
      variableId="tasmax"
      layerMin={-23.34}
      value={"false"}
      onChange={noop}
    />,
    div,
  );
});

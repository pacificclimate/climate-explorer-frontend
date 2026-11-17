import React from "react";
import { render } from "../../../test_support/render";
import PaletteSelector from "../PaletteSelector.jsx";
import { noop } from "lodash";

it("renders without crashing", () => {
  const div = document.createElement("div");
  render(
    <PaletteSelector name="Raster" value="seq-Blues" onChange={noop} />,
    div,
  );
});

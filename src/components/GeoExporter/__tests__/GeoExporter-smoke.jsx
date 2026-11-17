import React from "react";
import { render } from "../../../test_support/render";
import GeoExporter from "../GeoExporter";
import { noop } from "lodash";

it("renders without crashing", () => {
  const div = document.createElement("div");
  render(<GeoExporter onLoadArea={noop} />, div);
});

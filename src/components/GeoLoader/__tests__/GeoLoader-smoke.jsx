import React from "react";
import { render } from "../../../test_support/render";
import GeoLoader from "../GeoLoader";
import { noop } from "lodash";

it("renders without crashing", () => {
  const div = document.createElement("div");
  render(<GeoLoader onLoadArea={noop} />, div);
});

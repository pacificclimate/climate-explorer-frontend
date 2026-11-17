import React from "react";
import { render } from "../../../test_support/render";
import GeoLoaderErrorDialog from "../GeoLoaderErrorDialog.jsx";
import { noop } from "lodash";

it("renders without crashing", () => {
  const div = document.createElement("div");
  render(<GeoLoaderErrorDialog show open={noop} close={noop} />, div);
});

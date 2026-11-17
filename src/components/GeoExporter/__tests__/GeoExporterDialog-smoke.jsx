import React from "react";
import { render } from "../../../test_support/render";
import GeoExporterDialog from "../GeoExporterDialog.jsx";
import { noop } from "lodash";

it("renders without crashing", () => {
  const div = document.createElement("div");
  render(
    <GeoExporterDialog show open={noop} close={noop} onLoadArea={noop} />,
    div,
  );
});

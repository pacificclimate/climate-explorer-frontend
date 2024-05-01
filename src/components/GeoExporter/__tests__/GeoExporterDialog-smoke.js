import React from "react";
import ReactDOM from "react-dom";
import GeoExporterDialog from "../GeoExporterDialog";
import { noop } from "lodash";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <GeoExporterDialog show open={noop} close={noop} onLoadArea={noop} />,
    div,
  );
});

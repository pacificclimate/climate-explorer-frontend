import React from "react";
import ReactDOM from "react-dom";
import ExportButtons from "../ExportButtons";
import { noop } from "lodash";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <ExportButtons onExportXlsx={noop} onExportCsv={noop} />,
    div,
  );
});

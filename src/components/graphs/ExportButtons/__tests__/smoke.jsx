import React from "react";
import { render } from "../../../../test_support/render";
import ExportButtons from "../ExportButtons.jsx";
import { noop } from "lodash";

it("renders without crashing", () => {
  const div = document.createElement("div");
  render(<ExportButtons onExportXlsx={noop} onExportCsv={noop} />, div);
});

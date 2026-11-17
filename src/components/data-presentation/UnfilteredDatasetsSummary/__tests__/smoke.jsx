import React from "react";
import { render } from "../../../../test_support/render";
import UnfilteredDatasetsSummary from "../UnfilteredDatasetsSummary.jsx";
import { meta } from "../../../../test_support/data";

it("renders without crashing", () => {
  const div = document.createElement("div");
  render(<UnfilteredDatasetsSummary meta={meta} />, div);
});

import React from "react";
import { render } from "../../../../test_support/render";
import FlowArrow from "../FlowArrow.jsx";

it("renders without crashing", () => {
  const div = document.createElement("div");
  render(<FlowArrow />, div);
});

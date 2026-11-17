//Smoke test for the WatershedSummaryTable panel
import React from "react";
import { render } from "../../../test_support/render";
import WatershedSummaryTable from "../WatershedSummaryTable.jsx";
import { watershed_wkt } from "../../../test_support/data";

vi.mock("../../../data-services/ce-backend");

it("renders without crashing", () => {
  const div = document.createElement("div");
  render(
    <WatershedSummaryTable
      area={watershed_wkt}
      ensemble_name={"upper_fraser"}
    />,
    div,
  );
});

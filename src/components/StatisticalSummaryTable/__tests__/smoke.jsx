import React from "react";
import { render } from "../../../test_support/render";
import StatisticalSummaryTable from "../StatisticalSummaryTable.jsx";
import { meta } from "../../../test_support/data";

vi.mock("../../../data-services/ce-backend");

it("renders without crashing", () => {
  const div = document.createElement("div");
  render(
    <StatisticalSummaryTable
      model_id={"GFDL-ESM2G"}
      variable_id={"tasmax"}
      experiment={"historical,rcp26"}
      meta={meta}
    />,
    div,
  );
});

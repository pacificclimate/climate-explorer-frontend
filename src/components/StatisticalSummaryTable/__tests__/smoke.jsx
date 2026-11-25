import React, { act } from "react";
import { render } from "../../../test_support/render";
import StatisticalSummaryTable from "../StatisticalSummaryTable.jsx";
import { meta } from "../../../test_support/data";

vi.mock("../../../data-services/ce-backend");

it("renders without crashing", async () => {
  const div = document.createElement("div");
  await act(async () => {
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
});

import React from "react";
import { render } from "../../../../test_support/render";
import FilteredDatasetsSummary from "../FilteredDatasetsSummary.jsx";
import { meta } from "../../../../test_support/data";

it("renders without crashing", () => {
  const div = document.createElement("div");
  render(
    <FilteredDatasetsSummary
      model_id={"GFDL-ESM2G"}
      experiment={"historical,rcp26"}
      variable_id={"tasmax"}
      meta={meta}
    />,
    div,
  );
});

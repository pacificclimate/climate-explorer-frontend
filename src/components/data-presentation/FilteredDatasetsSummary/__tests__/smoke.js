import React from "react";
import ReactDOM from "react-dom";
import FilteredDatasetsSummary from "../";
import { meta } from "../../../../test_support/data";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <FilteredDatasetsSummary
      model_id={"GFDL-ESM2G"}
      experiment={"historical,rcp26"}
      variable_id={"tasmax"}
      meta={meta}
    />,
    div,
  );
});

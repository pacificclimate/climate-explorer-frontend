import { renderComponent } from "../../../test_support/render";
import React from "react";
import TestUtils from "react-dom/test-utils";
import DataTable from "../DataTable.jsx";

describe("DataTable", function () {
  it("renders", function () {
    var table = renderComponent(<DataTable data={[]} />);
    expect(TestUtils.isCompositeComponent(table)).toBeTruthy();
  });
});

import { renderComponent } from "../../../test_support/render";
// Smoke test for the Attribute Value Table
import React from "react";
import TestUtils from "react-dom/test-utils";
import AttributeValueTable from "../AttributeValueTable.jsx";

describe("AttributeValueTable", function () {
  it("renders", function () {
    var table = renderComponent(<AttributeValueTable data={[]} />);
    expect(TestUtils.isCompositeComponent(table)).toBeTruthy();
  });
});

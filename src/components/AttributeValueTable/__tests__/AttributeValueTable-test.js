// Smoke test for the Attribute Value Table
import React from "react";
import TestUtils from "react-dom/test-utils";
import AttributeValueTable from "../AttributeValueTable";

jest.dontMock("../AttributeValueTable");
jest.dontMock("../../../core/util");

describe("AttributeValueTable", function () {
  it("renders", function () {
    var table = TestUtils.renderIntoDocument(<AttributeValueTable data={[]} />);
    expect(TestUtils.isCompositeComponent(table)).toBeTruthy();
  });
});

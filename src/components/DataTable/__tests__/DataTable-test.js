import React from "react";
import TestUtils from "react-dom/test-utils";
import DataTable from "../DataTable";

jest.dontMock("../DataTable");
jest.dontMock("../../../core/util");

describe("DataTable", function () {
  it("renders", function () {
    var table = TestUtils.renderIntoDocument(<DataTable data={[]} />);
    expect(TestUtils.isCompositeComponent(table)).toBeTruthy();
  });
});

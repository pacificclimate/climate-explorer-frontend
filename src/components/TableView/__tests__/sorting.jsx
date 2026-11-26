import React, { act } from "react";
import { render } from "../../../test_support/render";
import TableView, { Column } from "../TableView";

it("sorts numeric columns in both directions without changing the export data", () => {
  const data = [
    { id: "a", value: 12 },
    { id: "b", value: 2 },
  ];
  const container = render(
    <TableView data={data}>
      <Column dataField="id" isKey>
        ID
      </Column>
      <Column dataField="value" dataSort>
        Value
      </Column>
    </TableView>,
  );
  const values = () =>
    [...container.querySelectorAll("tbody tr")].map(
      (row) => row.lastChild.textContent,
    );
  act(() => container.querySelector("button").click());
  expect(values()).toEqual(["2", "12"]);
  act(() => container.querySelector("button").click());
  expect(values()).toEqual(["12", "2"]);
  expect(data.map((row) => row.id)).toEqual(["a", "b"]);
});

it("displays loading or error messages when no rows are available", () => {
  const container = render(
    <TableView data={[]} options={{ noDataText: "Loading data..." }}>
      <Column dataField="value">Value</Column>
    </TableView>,
  );
  expect(container.querySelector("tbody").textContent).toBe("Loading data...");
});

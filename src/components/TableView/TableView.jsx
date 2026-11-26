import React, { Children, useState } from "react";
import { Table } from "react-bootstrap";

// Column children describe the fields in the table.
export function Column() {
  return null;
}

function compareValues(a, b) {
  if (a == null) return b == null ? 0 : 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

export default function TableView({ data, options = {}, children, ...props }) {
  const columns = Children.toArray(children).map((child) => child.props);
  const [sort, setSort] = useState({ field: null, descending: false });
  const rows = [...(data || [])];
  if (sort.field) {
    rows.sort((left, right) => {
      const order = compareValues(left[sort.field], right[sort.field]);
      return sort.descending ? -order : order;
    });
  }
  const keyField = columns.find((column) => column.isKey)?.dataField;
  return (
    <Table bordered responsive {...props}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.dataField}
              style={{ width: column.width, textAlign: column.dataAlign }}
              aria-sort={
                column.dataSort
                  ? sort.field === column.dataField
                    ? sort.descending
                      ? "descending"
                      : "ascending"
                    : "none"
                  : undefined
              }
            >
              {column.dataSort ? (
                <button
                  type="button"
                  className="table-sort"
                  onClick={() =>
                    setSort({
                      field: column.dataField,
                      descending:
                        sort.field === column.dataField && !sort.descending,
                    })
                  }
                >
                  {column.children}
                  <span aria-hidden="true">
                    {sort.field === column.dataField
                      ? sort.descending
                        ? " ▼"
                        : " ▲"
                      : " ↕"}
                  </span>
                </button>
              ) : (
                column.children
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length ? (
          rows.map((row, index) => (
            <tr key={row[keyField] ?? index}>
              {columns.map((column) => (
                <td
                  key={column.dataField}
                  style={{ textAlign: column.dataAlign }}
                >
                  {row[column.dataField]}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length}>
              {options.noDataText ?? "There is no data to display"}
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

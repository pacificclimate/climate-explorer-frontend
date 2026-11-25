import React from "react";
import { render } from "../../../../test_support/render";
import DataGraph from "../DataGraph";

it("updates charts after props change and destroys them when replaced or unmounted", () => {
  const previousC3 = window.c3;
  const charts = [];
  const generate = vi.fn(() => {
    const chart = { destroy: vi.fn() };
    charts.push(chart);
    return chart;
  });
  window.c3 = { generate };
  try {
    const container = render(
      <DataGraph data={{ columns: [["temperature", 1]] }} />,
    );
    render(<DataGraph data={{ columns: [["temperature", 2]] }} />, container);
    expect(generate).toHaveBeenCalledTimes(2);
    expect(generate.mock.calls[1][0].data.columns).toEqual([
      ["temperature", 2],
    ]);
    expect(charts[0].destroy).toHaveBeenCalledTimes(1);
    render(null, container);
    expect(charts[1].destroy).toHaveBeenCalledTimes(1);
  } finally {
    window.c3 = previousC3;
  }
});

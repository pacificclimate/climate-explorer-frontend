import React, { act } from "react";
import { render } from "../../../../test_support/render";
import { getData } from "../../../../data-services/ce-backend";
import ContextGraph from "../ContextGraph";

vi.mock("../../../../data-services/ce-backend", async (importOriginal) => ({
  ...(await importOriginal()),
  getData: vi.fn(() =>
    Promise.resolve({ data: { run: { data: [1], units: "K" } } }),
  ),
}));
vi.mock("../../DataGraph/DataGraph.jsx", () => ({
  default: ({ data }) => <div>{data.columns[0]?.[0]}</div>,
}));

it("highlights a new model using cached data and reloads when the variable changes", async () => {
  const contextMeta = [{}];
  const getMetadata = () => contextMeta;
  const dataToGraphSpec = (_metadata, _data, model) => ({
    data: { columns: [[model, 1]] },
  });
  const view = (model_id, variable_id = "tasmax") => (
    <ContextGraph
      {...{ model_id, variable_id, contextMeta, getMetadata, dataToGraphSpec }}
    />
  );
  let container;
  await act(async () => {
    container = render(view("model-a"));
  });
  expect(container.textContent).toBe("model-a");
  render(view("model-b"), container);
  expect(container.textContent).toBe("model-b");
  expect(getData).toHaveBeenCalledOnce();
  await act(async () => {
    render(view("model-b", "pr"), container);
  });
  expect(getData).toHaveBeenCalledTimes(2);
});

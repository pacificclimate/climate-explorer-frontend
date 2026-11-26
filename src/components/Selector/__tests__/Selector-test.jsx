import React, { act } from "react";
import { render } from "../../../test_support/render";
import Selector from "../Selector.jsx";

async function mount(props = {}, open = false) {
  let container;
  await act(async () => {
    container = render(<Selector {...props} />);
  });
  if (open) await act(async () => container.querySelector("button").click());
  return container;
}

it("sets the label", async () => {
  const container = await mount({ label: "New Label" });
  expect(container.querySelector("label").textContent).toBe("New Label");
});

it.each([
  [
    ["apple", "banana", "carrot"],
    ["apple", "banana", "carrot"],
  ],
  [
    [
      ["apple_value", "Apple label"],
      ["banana_value", "Banana label"],
    ],
    ["Apple label", "Banana label"],
  ],
])("displays dropdown choices", async (items, labels) => {
  const container = await mount({ items }, true);
  expect(
    [...container.querySelectorAll(".dropdown-item")].map(
      (node) => node.textContent,
    ),
  ).toEqual(labels);
});

it("does not select choices marked as unavailable", async () => {
  const onChange = vi.fn();
  const container = await mount(
    {
      onChange,
      items: [
        ["apple", "Apple", true],
        ["banana", "Banana", false],
      ],
    },
    true,
  );
  const items = container.querySelectorAll(".dropdown-item");
  await act(async () => items[0].click());
  expect(onChange).not.toHaveBeenCalled();
  await act(async () => items[1].click());
  expect(onChange).toHaveBeenCalledWith("banana");
});

it("calls the callback with the selected value", async () => {
  const onChange = vi.fn();
  const container = await mount({
    onChange,
    items: [
      ["one", "first"],
      ["two", "second"],
    ],
  });
  await act(async () => container.querySelector("button").click());
  await act(async () =>
    container.querySelectorAll(".dropdown-item")[1].click(),
  );
  expect(onChange).toHaveBeenCalledWith("two");
});

it("updates the selected label and keeps a valid dropdown ID for rich labels", async () => {
  const view = (label) => (
    <Selector
      label={<span>Variable</span>}
      value="tasmax"
      items={[["tasmax", label]]}
    />
  );
  let container;
  await act(async () => {
    container = render(view("Temperature"));
  });
  const button = () => container.querySelector("button");
  const id = button().id;
  expect(id).toMatch(/^selector-/);
  expect(button().textContent).toContain("Temperature");
  await act(async () => {
    render(view("Maximum temperature"), container);
  });
  expect(button().id).toBe(id);
  expect(button().textContent).toContain("Maximum temperature");
});

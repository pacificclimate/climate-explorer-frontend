import { act, cloneElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach } from "vitest";

const roots = new Map();

// Flush React 18 updates and release Leaflet maps/listeners after each test.
export function render(element, container = document.createElement("div")) {
  if (!roots.has(container)) roots.set(container, createRoot(container));
  act(() => roots.get(container).render(element));
  return container;
}

// Preserve class instances used by the existing React TestUtils assertions.
export function renderComponent(element) {
  let instance;
  render(
    cloneElement(element, {
      ref: (value) => {
        instance = value;
      },
    }),
  );
  return instance;
}

afterEach(() => {
  act(() => {
    for (const root of roots.values()) root.unmount();
  });
  roots.clear();
});

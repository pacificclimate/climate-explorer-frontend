import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach } from "vitest";

const roots = new Map();

// Flush React 18 updates and release Leaflet maps/listeners after each test.
export function render(element, container = document.createElement("div")) {
  if (!roots.has(container)) roots.set(container, createRoot(container));
  act(() => roots.get(container).render(element));
  return container;
}

afterEach(() => {
  act(() => {
    for (const root of roots.values()) root.unmount();
  });
  roots.clear();
});

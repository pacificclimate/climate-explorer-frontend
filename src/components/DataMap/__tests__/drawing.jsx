import React, { act } from "react";
import { render } from "../../../test_support/render";
import DataMap from "../DataMap";
import L from "../../../core/leaflet";
import { getWatershed } from "../../../data-services/ce-backend";

vi.mock("../../../data-services/ce-backend", async (importOriginal) => {
  const { watershed } = await import(
    "../../../core/__test_data__/sample-API-results"
  );
  return {
    ...(await importOriginal()),
    getWatershed: vi.fn(() => Promise.resolve({ data: watershed })),
  };
});

let container;
let instance;
let map;
let onSetArea;
beforeEach(() => {
  container = document.createElement("div");
  onSetArea = vi.fn();
});

function mount(props = {}) {
  render(
    <DataMap
      ref={(value) => {
        instance = value;
      }}
      onSetArea={onSetArea}
      {...props}
    />,
    container,
  );
  map = instance.map;
  map.setView([52, -123], 7, { animate: false });
}
const toolbar = (icon) =>
  map.getContainer().querySelector(`.leaflet-pm-icon-${icon}`);
const action = (name) =>
  map.getContainer().querySelector(`.button-container.active .action-${name}`);
function clickAt(latlng) {
  const { x, y } = map.latLngToContainerPoint(latlng);
  for (const type of ["mousemove", "click"]) {
    map.getContainer().dispatchEvent(
      new MouseEvent(type, {
        bubbles: true,
        clientX: x,
        clientY: y,
        button: 0,
      }),
    );
  }
}
function rectangle() {
  toolbar("rectangle").click();
  clickAt([51.8, -123.2]);
  clickAt([52.2, -122.8]);
}

it("draws, edits and clears a selection, then allows drawing again", () => {
  mount();
  act(rectangle);
  const [layer] = instance.state.geometryLayers;
  expect(layer).toBeInstanceOf(L.Rectangle);
  expect(onSetArea).toHaveBeenLastCalledWith(layer.toGeoJSON());
  expect(toolbar("rectangle")).toBeNull();
  act(() => {
    toolbar("edit").click();
    layer.setBounds([
      [51.7, -123.3],
      [52.3, -122.7],
    ]);
    layer.fire("pm:edit", { layer });
    action("finishMode").click();
  });
  expect(onSetArea).toHaveBeenLastCalledWith(layer.toGeoJSON());
  act(() => {
    toolbar("delete").click();
    action("clearAll").click();
  });
  expect(onSetArea).toHaveBeenLastCalledWith(undefined);
  expect(map.hasLayer(layer)).toBe(false);
  expect(toolbar("rectangle")).not.toBeNull();
  act(rectangle);
  expect(instance.state.geometryLayers).toHaveLength(1);
});

it("makes imported polygons editable and removable", () => {
  mount();
  const polygon = L.polygon([
    [51.8, -123.2],
    [52.2, -123.2],
    [52.2, -122.8],
  ]).toGeoJSON();
  act(() => instance.handleUploadArea(polygon));
  const [layer] = instance.state.geometryLayers;
  expect(layer.pm).toBeDefined();
  act(() => {
    toolbar("edit").click();
  });
  expect(layer.pm.enabled()).toBe(true);
  act(() => {
    action("finishMode").click();
    toolbar("delete").click();
    layer.fire("click");
  });
  expect(instance.state.geometryLayers).toHaveLength(0);
  expect(onSetArea).toHaveBeenLastCalledWith(undefined);
});

it("selects an outlet and removes its protected watershed together", async () => {
  mount({ pointSelect: true, watershedEnsemble: "watersheds" });
  expect(toolbar("rectangle")).toBeNull();
  await act(async () => {
    toolbar("circle-marker").click();
    clickAt([52, -123]);
  });
  const [outlet, boundary] = instance.state.geometryLayers;
  expect(outlet).toBeInstanceOf(L.CircleMarker);
  expect(boundary).toBeDefined();
  expect(boundary.pm).toBeUndefined();
  expect(toolbar("edit")).toBeNull();
  expect(onSetArea).toHaveBeenLastCalledWith(outlet.toGeoJSON());
  act(() => {
    toolbar("delete").click();
    outlet.fire("click");
  });
  expect(instance.state.geometryLayers).toHaveLength(0);
  expect(map.hasLayer(boundary)).toBe(false);
  expect(toolbar("circle-marker")).not.toBeNull();
});

it("ignores a watershed response after its outlet has been deleted", async () => {
  let respond;
  vi.mocked(getWatershed).mockReturnValueOnce(
    new Promise((resolve) => {
      respond = resolve;
    }),
  );
  mount({ pointSelect: true, watershedEnsemble: "watersheds" });
  act(() => {
    toolbar("circle-marker").click();
    clickAt([52, -123]);
  });
  act(() => {
    toolbar("delete").click();
    instance.state.geometryLayers[0].fire("click");
  });
  const { watershed } = await import(
    "../../../core/__test_data__/sample-API-results"
  );
  await act(async () => respond({ data: watershed }));
  expect(instance.state.geometryLayers).toHaveLength(0);
  expect(onSetArea).toHaveBeenLastCalledWith(undefined);
  expect(toolbar("circle-marker")).not.toBeNull();
});

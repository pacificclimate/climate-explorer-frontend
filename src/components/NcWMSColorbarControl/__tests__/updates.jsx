import React from "react";
import { MapContainer } from "react-leaflet";
import L from "../../../core/leaflet";
import { render } from "../../../test_support/render";
import NcWMSColorbarControl from "../NcWMSColorbarControl";

it("keeps legend labels on opacity updates and refreshes them when the range changes", () => {
  const layer = L.tileLayer.wms(window.env.REACT_APP_NCWMS_URL, {
    layers: "dataset/tasmax",
    styles: "default-scalar/seq-Greys",
    colorscalerange: "1,9",
  });
  const range = { min: 1, max: 9 };
  const view = (opacity, range) => (
    <div data-opacity={opacity}>
      <MapContainer center={[60, -100]} zoom={1}>
        <NcWMSColorbarControl layer={layer} range={range} />
      </MapContainer>
    </div>
  );
  const container = render(view(0.7, range));
  const legend = [...container.querySelectorAll(".leaflet-control")].find(
    (control) => control.style.backgroundImage.includes("GetLegendGraphic"),
  );
  const maximumLabel = legend.firstChild;
  expect(maximumLabel.textContent).toBe("9");

  render(view(0.3, range), container);
  expect(legend.firstChild).toBe(maximumLabel);
  expect(maximumLabel.textContent).toBe("9");

  layer.setParams({ colorscalerange: "2,20" });
  render(view(0.3, { min: 2, max: 20 }), container);
  expect(legend.firstChild.textContent).toBe("20");
  expect(legend.lastChild.textContent).toBe("2");
});

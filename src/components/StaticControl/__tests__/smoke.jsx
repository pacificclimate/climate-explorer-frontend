import React, { createContext, useContext } from "react";
import { MapContainer } from "react-leaflet";
import { render } from "../../../test_support/render";
import StaticControl from "../StaticControl.jsx";

it("renders control content with the application's React context", () => {
  const Context = createContext("missing");
  function Content() {
    return <span>{useContext(Context)}</span>;
  }
  const container = render(
    <Context.Provider value="application context">
      <MapContainer center={[60, -100]} zoom={1}>
        <StaticControl position="topright">
          <Content />
        </StaticControl>
      </MapContainer>
    </Context.Provider>,
  );
  expect(container.querySelector(".StaticControl").textContent).toBe(
    "application context",
  );
});

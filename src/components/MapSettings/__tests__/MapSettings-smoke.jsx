import React from "react";
import ReactDOM from "react-dom";
import MapSettings from "../MapSettings";
import { noop } from "lodash";
import { meta, times } from "../../../test_support/data";

describe("with one variable", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <MapSettings
        title="Map Settings"
        meta={meta}
        dataSpec="r1i1p1 1961-1990"
        onDataSpecChange={noop}
        raster={{
          times,
          timeIdx: Object.keys(times)[0],
          palette: "seq-Blues",
          range: { min: -23 },
          logscale: "false",
          onChangeTime: noop,
          onChangePalette: noop,
          onChangeScale: noop,
        }}
        hasComparand={false}
        timesLinkable={false}
      />,
      div,
    );
  });
});

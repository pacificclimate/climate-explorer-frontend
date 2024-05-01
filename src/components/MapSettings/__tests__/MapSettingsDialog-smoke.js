import React from "react";
import ReactDOM from "react-dom";
import MapSettingsDialog from "../MapSettingsDialog";
import { noop } from "lodash";
import { meta, times } from "../../../test_support/data";

describe("with one variable", () => {
  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
      <MapSettingsDialog
        show={true}
        open={noop}
        close={noop}
        title={"foo"}
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
      />,
      div,
    );
  });
});

import React from "react";
import { render } from "../../../test_support/render";
import TimeSelector from "../TimeSelector.jsx";
import { noop } from "lodash";
import { times } from "../../../test_support/data";

it("renders without crashing", () => {
  const div = document.createElement("div");
  render(
    <TimeSelector
      name="Raster"
      times={times}
      timeLinked={false}
      timeIdx={Object.keys(times)[0]}
      onChange={noop}
    />,
    div,
  );
});

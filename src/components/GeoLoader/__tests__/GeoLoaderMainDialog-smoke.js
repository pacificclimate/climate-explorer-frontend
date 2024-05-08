import React from "react";
import ReactDOM from "react-dom";
import GeoLoaderMainDialog from "../GeoLoaderMainDialog";
import { noop } from "lodash";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(
    <GeoLoaderMainDialog
      show
      open={noop}
      close={noop}
      controls={[
        {
          show: () => true,
          open: noop,
          close: noop,
        },
        {
          show: () => true,
          open: noop,
          close: noop,
        },
      ]}
      onLoadArea={noop}
    />,
    div,
  );
});

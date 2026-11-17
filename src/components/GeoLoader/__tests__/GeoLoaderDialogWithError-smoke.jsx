import React from "react";
import { render } from "../../../test_support/render";
import GeoLoaderDialogWithError from "../GeoLoaderDialogWithError";
import { noop } from "lodash";

it("renders without crashing", () => {
  const div = document.createElement("div");
  render(
    <GeoLoaderDialogWithError
      show
      open={noop}
      close={noop}
      controls={[
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

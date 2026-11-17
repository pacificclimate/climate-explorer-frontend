import React from "react";
import { render } from "../../../../test_support/render";
import { MemoryRouter } from "react-router-dom";
import NavRoutes from "../NavRoutes.jsx";
import { noop } from "lodash";

const navSpec = {
  basePath: "/basePath",
  items: [
    {
      label: "Alpha",
      info: "Alpha info",
      subPath: "alpha",
      component: null,
    },
  ],
};

it("renders without crashing", () => {
  const div = document.createElement("div");
  render(
    <MemoryRouter>
      <NavRoutes navSpec={navSpec} navIndex={0} onNavigate={noop} />
    </MemoryRouter>,
    div,
  );
});

import React from "react";
import { render } from "../../../../test_support/render";
import Information from "../Information.jsx";

it("renders without crashing", () => {
  const div = document.createElement("div");
  render(<Information>information</Information>, div);
});

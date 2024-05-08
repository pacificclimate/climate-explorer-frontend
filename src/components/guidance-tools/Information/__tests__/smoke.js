import React from "react";
import ReactDOM from "react-dom";
import Information from "../Information";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<Information>information</Information>, div);
});

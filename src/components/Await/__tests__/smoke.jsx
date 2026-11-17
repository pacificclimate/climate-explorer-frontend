import React, { act } from "react";
import { render } from "../../../test_support/render";
import Await from "../Await.jsx";

it("renders without crashing", async () => {
  const div = document.createElement("div");
  await act(async () => {
    render(
      <Await promises={[Promise.resolve("yup"), Promise.resolve("uh-huh")]}>
        <div>The awesomeness</div>
      </Await>,
      div,
    );
  });
});

// Cannot get this test to pass. Hence the renamed __tests__ directory.
// There is a problem with C3; see https://github.com/c3js/c3/issues/2129
// but the recommended solutions do not work. Preserving this attempt in the
// hope that some future effort can actually make it work.

// TODO: Make this work and rename __x_tests__ --> __tests__

// TODO: Enzyme has been removed from the project. This test should be rewritten
// It seems to be locked to react 16 

import React from "react";
import { shallow } from "enzyme";
import App from "../App";

it("renders without crashing", () => {
  shallow(<App />);
});

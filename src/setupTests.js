import "./core/lodash.mixins";

// include our default config properties
import "../public/config.js";

// core/util preloads runtime options as a module side effect. Keep unit tests
// offline and leave its cache empty unless a test supplies options explicitly.
vi.mock("./data-services/public.js", () => ({
  getVariableOptions: () => new Promise(() => {}),
}));

window.SVGPathElement = function () {};

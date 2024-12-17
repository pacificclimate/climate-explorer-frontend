import "./core/lodash.mixins";

// include our default config properties
require("../public/config.js");

// configure({ adapter: new Adapter() });

// global.SVGPathElement = function () {};
var JSDOM = require("jsdom").JSDOM;
global.window = new JSDOM().window;
window.SVGPathElement = function () {};

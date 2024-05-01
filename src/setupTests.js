import "./core/lodash.mixins";

// configure({ adapter: new Adapter() });

// global.SVGPathElement = function () {};
var JSDOM = require("jsdom").JSDOM;
global.window = new JSDOM().window;
window.SVGPathElement = function () {};

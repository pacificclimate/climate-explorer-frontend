import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

// global.SVGPathElement = function () {};
var JSDOM = require('jsdom').JSDOM;
global.window = new JSDOM().window;
window.SVGPathElement = function () {};

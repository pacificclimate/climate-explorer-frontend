import L from "leaflet";
import Proj from "proj4leaflet";

// Proj4Leaflet's CommonJS import can replace the global Leaflet instance.
// Geoman extends global L, so keep it on the instance used by the app.
L.Proj = Proj;
window.L = L;

export default L;

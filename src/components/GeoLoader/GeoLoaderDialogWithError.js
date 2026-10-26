import compAcontrolsB from "../../HOCs/compAcontrolsB.jsx";
import GeoLoaderMainDialog from "./GeoLoaderMainDialog.jsx";
import GeoLoaderErrorDialog from "./GeoLoaderErrorDialog.jsx";

export default compAcontrolsB(
  GeoLoaderMainDialog,
  GeoLoaderErrorDialog,
  "div",
  "GeoLoaderDialogWithError",
);

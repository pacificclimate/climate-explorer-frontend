import compAcontrolsB from "../../HOCs/compAcontrolsB.jsx";
import GeoLoaderButton from "./GeoLoaderButton.jsx";
import GeoLoaderDialogWithError from "./GeoLoaderDialogWithError";

export default compAcontrolsB(
  GeoLoaderButton,
  GeoLoaderDialogWithError,
  "div",
  "GeoLoader",
);

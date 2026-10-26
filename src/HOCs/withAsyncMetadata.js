// A HOC to inject asynchronously fetched metadata.
import withAsyncData from "./withAsyncData.jsx";
import { getMetadata } from "../data-services/ce-backend";

export default withAsyncData(getMetadata, "ensemble_name", "meta");

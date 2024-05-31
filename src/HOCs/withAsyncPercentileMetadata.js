// This HOC injects asynchronously fetched metadata describing percentile datasets
import withAsyncData from "./withAsyncData";
import { getPercentileMetadata } from "../data-services/ce-backend";

export default withAsyncData(
  getPercentileMetadata,
  "ensemble_name",
  "percentileMeta",
);

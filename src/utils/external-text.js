import axios from "axios";
import yaml from "js-yaml";

export function makeYamlLoader(url) {
  // Returns a function that can be used as the callback argument `loadTexts`
  // to `ExternalTexts.Provider`. It issues an HTTP GET to `url`; treats
  // the result as a YAML file, converting it to a JS object; then calls its
  // argument `setTexts` with the resulting object. Any error thrown during
  // this process is logged to the console (and `setTexts` is not called).
  return function (setTexts) {
    axios
      .get(url, { responseType: "text" })
      .then((response) => response.data)
      .then(yaml.safeLoad)
      .then(setTexts)
      .catch((error) => {
        console.error(error);
      });
  };
}

import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "bootstrap-slider/dist/css/bootstrap-slider.min.css";
// import 'perfect-scrollbar/dist/css/perfect-scrollbar.min.css';
import "c3/c3.min.css";
import "react-bootstrap-table/dist/react-bootstrap-table-all.min.css";

import ExternalText from "pcic-react-external-text";
import { makeYamlLoader } from "./utils/external-text";
import App from "./components/App";
import * as serviceWorker from "./serviceWorker";

import "./core/lodash.mixins";

const loadTexts = makeYamlLoader(
  `${window.env.PUBLIC_URL}/${window.env.REACT_APP_EXTERNAL_TEXT}`,
);

ReactDOM.render(
  <ExternalText.Provider loadTexts={loadTexts}>
    <App />
  </ExternalText.Provider>,
  document.getElementById("wrapper"),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

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
import App from "./components/App/App.jsx";
import c3Url from "c3/c3.js?url";
import d3Url from "d3/d3.js?url";

import "./core/lodash.mixins";

const loadTexts = makeYamlLoader(
  `${window.env.PUBLIC_URL}/${window.env.REACT_APP_EXTERNAL_TEXT}`,
);

const renderApp = () => {
  ReactDOM.render(
    <ExternalText.Provider loadTexts={loadTexts}>
      <App />
    </ExternalText.Provider>,
    document.getElementById("wrapper"),
  );
};

const c3Script = document.createElement("script");
c3Script.src = c3Url;
c3Script.onload = renderApp;

const d3Script = document.createElement("script");
d3Script.src = d3Url;
d3Script.onload = () => document.head.appendChild(c3Script);
document.head.appendChild(d3Script);

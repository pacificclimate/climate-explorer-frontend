// App: Top-level component of the Climate Explorer app.
//
// Defines top-level navigation and routes.
//
// Controls the DataTool component (the main attraction; path `/data`)
// so that it maintains which view is selected when navigated away from.
// Other components could be similarly managed, but it was not deemed useful.
// Easy enough to do if desired.

import React from "react";

import { Navbar } from "react-bootstrap";
import { BrowserRouter as Router } from "react-router-dom";

import T from "pcic-react-external-text";
import DataTool from "../DataTool";
import NavRoutes from "../navigation/NavRoutes";
import Help from "../guidance-content/help/Help";
import Science from "../guidance-content/science/Science";
import About from "../guidance-content/about/About";

import logo from "../../assets/logo.png";
import marmot from "../../assets/marmot.png";
import styles from "./App.module.css";
import "../../../node_modules/react-input-range/lib/css/index.css";

/**
 * When deploying the app to a URL that doesn't sit on the domain root we need to let the
 * app router know the location that it at so it knows what portion of the URL it is
 * responsible for.
 *
 * @returns string The base URL of the app
 */
const getBaseName = () => {
  if (window.env.PUBLIC_URL?.indexOf(".") >= 0) {
    return new URL(window.env.PUBLIC_URL).pathname;
  }

  return "";
};

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      navIndex: 0,
    };
  }

  handleNavigate = (navIndex) => {
    this.setState({ navIndex });
  };

  navSpec = {
    basePath: "",
    items: [
      {
        label: "Home/Data",
        subpath: "data",
        render: (props) => (
          <DataTool
            {...props}
            navIndex={this.state.navIndex}
            onNavigate={this.handleNavigate}
          />
        ),
      },
      {
        label: "Help",
        subpath: "help",
        component: Help,
      },
      {
        label: "Science",
        subpath: "science",
        component: Science,
      },
      {
        label: "About",
        subpath: "about",
        component: About,
      },
    ],
  };

  render() {
    return (
      <Router basename={getBaseName()}>
        <div>
          <NavRoutes navSpec={this.navSpec} navClassName={styles.mainNav}>
            <Navbar.Header>
              <Navbar.Brand className={styles.pcic_logo}>
                <a href="https://pacificclimate.org/">
                  <img
                    src={logo}
                    width="328"
                    height="38"
                    alt="Pacific Climate Impacts Consortium"
                  />
                </a>
              </Navbar.Brand>
              <Navbar.Brand className={styles.marmot_logo}>
                <img
                  src={marmot}
                  height={68}
                  alt="Vancouver Island Marmot"
                  title='"The Marmot": Graphic by permission, V.I. Marmot Recovery Foundation'
                />
              </Navbar.Brand>
              <Navbar.Brand>
                <T path="app.title" as="string" />{" "}
              </Navbar.Brand>
            </Navbar.Header>
          </NavRoutes>
        </div>
      </Router>
    );
  }
}

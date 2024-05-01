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
    // Setting `Router.basename` correctly is a little tricky, for two reasons:
    //
    // 1. Dynamic deployment to different URLs.
    // 2. Correctly handling requests containing client-side routes.
    //
    // Each of these concerns has different implications, as described below.
    //
    // 1. Dynamic deployment to different URLs.
    //
    // We don't want to set `basename` to a static value. If we did that,
    // deploying the app to a different URL would require us to modify code
    // and rebuild the app. This rules out both a static string here and
    // `process.env.PUBLIC_URL`, which is set by the `homepage` property in
    // `package.json`. (The latter approach is recommended in the
    // create-react-app documentation
    // (https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#building-for-relative-paths),
    // but it does not meet our needs here.)
    //
    // Instead, we set `basename` from an environment variable, `CE_BASE_PATH`,
    // which we set at deploy time, i.e., when the app is started.
    //
    // 2. Correctly handling requests containing client-side routes.
    //
    // Requests to the application be handled in two ways:
    //
    // A. Externally: That is, by the server proper. This occurs when
    //    a hyperlink to the app that originates outside the app (e.g., on
    //    a webpage somewhere) contains a client-side route component.
    //
    // B. Internally: By the app iteself, which is to say, by Router. This
    //    occurs when an internal `Link` is followed. `Router` intervenes and
    //    no request to the server is issued.
    //
    // Externally handled requests can cause errors: Most servers will, without
    // special configuration, respond to the entire request URL, not just the
    // base path. This results in errors, since what we'd like in this case
    // is for the server to serve the app (at the base path), not a non-existent
    // page identified by the base path plus the client-side routing part of
    // URL.
    //
    // There are two possible solutions to this problem:
    //
    // 1. Configure the server to ignore the client-side routing
    // part of the URL (i.e., to care only about the base path). See the
    // create-react-app documentation
    //    (https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#serving-apps-with-client-side-routing).
    //
    // 2. Use a hash (#) to separate the base path from the client-side routes.
    //    This makes the client-side route component not a part of the URL path.
    //
    // We choose option 2, hence the hash (#) following the base path in the
    // `Router.basename` value below.
    return (
      <Router basename={`${process.env.REACT_APP_CE_BASE_PATH}/#`}>
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

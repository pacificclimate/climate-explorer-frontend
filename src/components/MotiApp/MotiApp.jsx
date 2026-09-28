/******************************************************************
 * IMPORTANT: This component has fallen into disuse and has not been
 * kept up to date with changes to other similar components. See
 * https://github.com/pacificclimate/climate-explorer-frontend/issues/218
 ******************************************************************/

import React, { Component } from "react";
import Header from "../Header";
import MotiController from "../MotiController";

class App extends Component {
  render() {
    return (
      <div>
        <div>
          <Header />
        </div>
        <div>
          <MotiController />
        </div>
      </div>
    );
  }
}

export default App;

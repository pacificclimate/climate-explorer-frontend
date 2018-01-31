// HOC that composes two components, `A` and `B` (plus a wrapper component),
// such that `A` "controls" `B` in the sense that `A` triggers state changes
// that cause `B` to be in open/closed (show/hide) state.
//
// The canonical example of this is a button that opens a dialog.
//
// The purpose of this HOC is to encapsulate the injection of the open/closed
// state and callbacks into the controlling and controlled components.
//
// Components `A` and `B` are passed the following props:
//
// - All props passed to the component returned by the HOC, so that A and B can
//    construct content based on those props, necessary for many use cases.
//
// - Three new values set up here: `show`, `open`, `close`, to control the
//    behaviour of the controlled component B.
//
// Note: `B` (as well as `A`) is passed the state-control callbacks so that it
// can control itself if need be. However, `B` is not considered the
// primary controller.
//
// Components `A` and `B` are wrapped in component `Wrapper`, which defaults to 'div'.
// It may be better to make the default be the new `React.Fragment` component.
//
// This HOC is a special case of the React pattern "controlled component".
// The current implementation uses a boolean state, but this could easily
// be generalized by replacing callbacks `open` and `close` with a single
// `setStatus` callback that sets the `show` state (better renamed `status`).
// However, this would impose more boilerplate on the client components `A`
// and `B`. This two-state special case has wide application.
//
// For a simple example use case see component `GeoExporter`.
// For a complex example use case see component `MapSettings`.

import React from 'react';

export default function compAcontrolsB(A, B, Wrapper = 'div') {
  return class extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        show: false,
      };
    }

    open = () => {
      this.setState({ show: true });
    };

    close = () => {
      this.setState({ show: false });
    };

    render() {
      return (
        <Wrapper>
          <A open={this.open} close={this.close} {...this.props} />
          <B show={this.state.show} open={this.open} close={this.close} {...this.props} />
        </Wrapper>
      );
    }
  };
}


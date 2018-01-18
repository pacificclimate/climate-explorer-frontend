// HOC that composes two components, A and B (plus a wrapper component), such
// that A "controls" B in the sense that A triggers state changes that cause B
// to be in open/closed state.
//
// The canonical example of this is a button that opens a dialog.
//
// Components A and B are wrapped in component Wrapper, which defaults to div.
// It may be better to make the default be the new React fragment component.
//
// Note that B is also passed the state-controlling callbacks so that it
// can close (or open) itself if need be. However, B is not considered the
// primary controller.
//
// This HOC is a special case of the React pattern "controlled component".
// The current implementation uses a boolean state, but this could easily
// be generalized by replacing callbacks `open` and `close` with a single
// `setStatus` callback that sets the `show` state (better renamed `status`).
// However, this would impose more boilerplate on the client components A
// and B. This special case has wide application.
//
// Using this HOC in real application has some subtleties. Specifically:
//
//  - If you want to use props (or state) in the component returned by
//    a HOC, you have to wrap the result of the HOC in a component that
//    defines the props (or state), and render the result of the HOC.
//
//  - This enables you to define components that use those props and state
//    passed to the HOC.
//
//  - The components passed to the HOC must be *components*, not instantiations
//    (objects). Typically you'll want to define functional components
//    `A` and `B` on the class, and pass those functions as arguments to the
//    HOC.
//    Code fragment:
//
//      ButtonWithModal = buttonWithModal(this.A, this.B);
//
// For an example use case, see component GeoExporter.Modal.

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
          <A open={this.open} close={this.close} />
          <B show={this.state.show} open={this.open} close={this.close} />
        </Wrapper>
      );
    }
  };
}


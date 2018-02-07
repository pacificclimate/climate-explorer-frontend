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
// - Four new values set up here: `show`, `open`, `close`, `controls` to
//    control the behaviour of the controlled component B.
//    - The purpose and use of show`, `open`, `close` are obvious.
//    - `controls` is an array of all the A-controls-B control props passed
//        down through a chaining of A-controls-B components. `controls[0]`
//        is always the local (lowest) set of controls, and `controls[i]` for
//        `i` > 0 is the set of control props for the i-th parent of the local
//        A-controls-B component. This allows one A-controls-B component to
//        controlled by another, by using parent control props. (Without it,
//        only the local control props would be available, and that is not
//        sufficient.)
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
// For a complex example use case, including chained A-controls-B components,
// see component `GeoLoader`.

import PropTypes from 'prop-types';
import React from 'react';

import _ from 'underscore';


const controlPropNames = 'show open close controls'.split(' ');

export default function compAcontrolsB(A, B, Wrapper = 'div', label = '') {
  return class extends React.Component {
    static propTypes = {
      controls: PropTypes.array,
    };

    constructor(props) {
      super(props);

      this.state = {
        show: false,
      };
    }

    getShow = () => this.state.show;

    open = () => {
      this.setState({ show: true });
    };

    close = () => {
      this.setState({ show: false });
    };

    controls() {
      const control = [{
        show: this.getShow,
        open: this.open,
        close: this.close,
      }];
      return control.concat(this.props.controls || []);
    }

    render() {
      const nonControlProps = _.omit(this.props, controlPropNames);
      return (
        <Wrapper>
          <A
            show={this.state.show}
            open={this.open}
            close={this.close}
            controls={this.controls()}
            {...nonControlProps}
          />
          <B
            show={this.state.show}
            open={this.open}
            close={this.close}
            controls={this.controls()}
            {...nonControlProps}
          />
        </Wrapper>
      );
    }
  };
}

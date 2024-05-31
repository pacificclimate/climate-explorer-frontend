// Component for managing asynchronous readiness conditions.
//
// `Await` renders `props.awaiting` until all the promises in `props.promises`
// settle.
// If all promises resolve (no errors/rejects), `Await` renders its children.
// If any promise rejects, `Await` renders `props.error(error)` where error
// is the reason for rejection (IOW, `catch(error => ...)`).

import PropTypes from "prop-types";
import React from "react";

import _ from "lodash";

const promiseType = PropTypes.instanceOf(Promise);

export default class Await extends React.Component {
  static propTypes = {
    promises: PropTypes.oneOfType([
      promiseType,
      PropTypes.arrayOf(promiseType),
    ]),
    awaiting: PropTypes.node,
    error: PropTypes.element,
  };

  static defaultProps = {
    awaiting: <div>Waiting...</div>,
    error: (error) => (
      <div>
        {error.name}: {error.message}
      </div>
    ),
  };

  state = {
    isWaiting: true,
  };

  componentWillMount() {
    const promise = _.isArray(this.props.promises)
      ? Promise.all(this.props.promises)
      : this.props.promises;
    promise
      .then(() => {
        this.setState({ isWaiting: false });
      })
      .catch((error) => {
        this.setState({
          isWaiting: false,
          error,
        });
      });
  }

  render() {
    if (this.state.isWaiting) {
      return this.props.awaiting;
    }
    if (this.state.error) {
      return this.props.error(this.state.error);
    }
    return <div>{this.props.children}</div>;
  }
}

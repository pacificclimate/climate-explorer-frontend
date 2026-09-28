// Higher-order function returning a Higher-Order Component (HOC) that injects
// asynchronously fetched data into a component.
//
// (See https://reactjs.org/docs/higher-order-components.html#convention-maximizing-composability
// for why this HOC is separated into two parts like this.)
//
// To manage asynchronous data fetching, this component follows React best
// practice:
// https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#fetching-external-data-when-props-change
// This code is pretty much a straight-over port of that example.
//
// Data fetching occurs when the value of `this.props[controlProp]` changes.
// This is simpler, but adequate, special case of the general case that could
// be handled by passing in a function that compares all relevant props.
//
// The fetched data is injected into the base component through a prop passed
// to it named by `dataProp`.

import React from "react";
import Loader from "react-loader";

export default function withAsyncData(
  loadAsyncData, // Async data fetcher. Returns a promise.
  controlProp, // Name of prop that controls data fetching
  dataProp, // Name of prop to pass data to base component through
) {
  return function (BaseComponent) {
    return class extends React.Component {
      state = {
        externalData: null,
      };

      static getDerivedStateFromProps(props, state) {
        // Store previous control prop in state so we can compare when props
        // change.
        // Clear out previously-loaded data so we don't deliver stale data.
        if (props[controlProp] !== state.prevControl) {
          return {
            externalData: null,
            prevControl: props[controlProp],
          };
        }

        // No state update necessary
        return null;
      }

      componentDidMount() {
        this._loadAsyncData(this.props[controlProp]);
      }

      componentDidUpdate(prevProps, prevState) {
        if (this.state.externalData === null) {
          this._loadAsyncData(this.props[controlProp]);
        }
      }

      componentWillUnmount() {
        if (this._asyncRequest && this._asyncRequest.cancel) {
          this._asyncRequest.cancel();
        }
      }

      _loadAsyncData(...args) {
        this._asyncRequest = loadAsyncData(...args).then((externalData) => {
          this._asyncRequest = null;
          this.setState({ externalData });
        });
      }

      render() {
        if (this.state.externalData === null) {
          return <Loader />;
        }
        return (
          <BaseComponent
            {...{ [dataProp]: this.state.externalData }}
            {...this.props}
          />
        );
      }
    };
  };
}

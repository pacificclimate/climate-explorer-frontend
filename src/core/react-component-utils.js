// This module provides utility functions common across many components.

// Generic state setter HOF. Returns a handler that sets the named state.
//
// Typical usage: In component definition:
//  handleChangeFred = setNamedState(this, 'fred');
export const setNamedState = (this_, name) =>
  value => this_.setState({ [name]: value });

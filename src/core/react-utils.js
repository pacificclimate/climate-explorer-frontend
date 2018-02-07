function updateSingleState(name, value) {
  // Sets a single state property.
  // Typical usage is to bind `this` and `name` and use the resulting
  // function as a callback handler:
  //    handleChangeAState = this.updateSingleState.bind(this, 'aState');
  this.setState({ [name]: value });
}

export { updateSingleState };

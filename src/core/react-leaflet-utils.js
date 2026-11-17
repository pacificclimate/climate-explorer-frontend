function makeHandleLeafletRef(name, leafletAction = () => {}) {
  // Factory returning  a react-leaflet ref callback handler that sets
  // `this[name]` to the Leaflet element, then calls an optional action.
  // Don't forget to bind the result of this function to `this`!!
  return function (element) {
    this[name] = element;
    // It's important to check that the element is truthy, because
    // react-leaflet sometimes calls the `ref` callback with a null element
    // in the course of setting up a properly rendered component.
    if (element) {
      leafletAction(element);
    }
  };
}

function updateSingleStateLeaflet(name, value) {
  // Sets a single state property to the leaflet element associated with value.
  // Typical usage is to bind `this` and `name` and use the resulting
  // function as a callback handler:
  //    handleChangeALeafletState =
  //      this.updateSingleStateLeaflet.bind(this, 'aLeafletState');
  this.setState({ [name]: value });
}

export { makeHandleLeafletRef, updateSingleStateLeaflet };

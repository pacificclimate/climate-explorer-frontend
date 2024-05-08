function makeHandleLeafletRef(name, leafletAction = () => {}) {
  // Factory returning  a react-leaflet ref callback handler that sets
  // `this[name]` to the leaflet element of the component, then calls an
  // optional action function on that leaflet element.
  // Don't forget to bind the result of this function to `this`!!
  return function (element) {
    console.log("handleLeafletRef:", name);
    // It's important to check that the element is truthy, because
    // react-leaflet sometimes calls the `ref` callback with a null element
    // in the course of setting up a properly rendered component.
    if (element) {
      let leafletElement = element.leafletElement;
      this[name] = leafletElement;
      leafletAction(leafletElement);
    }
  };
}

function updateSingleStateLeaflet(name, value) {
  // Sets a single state property to the leaflet element associated with value.
  // Typical usage is to bind `this` and `name` and use the resulting
  // function as a callback handler:
  //    handleChangeALeafletState =
  //      this.updateSingleStateLeaflet.bind(this, 'aLeafletState');
  this.setState({ [name]: value && value.leafletElement });
}

export { makeHandleLeafletRef, updateSingleStateLeaflet };

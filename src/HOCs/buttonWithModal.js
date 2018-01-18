// HOC yielding a component that contains a button that opens a modal dialog.
//
// Parameters are the content of the button (e.g., text or Glyphicon) and
// the body of the modal dialog (which may contain multiple modal dialog
// subparts but must constitute a single React element; fortunately you can
// use a div for this).
//
// Using this HOC in real application is not quite as simple as it might seem.
// Specifically:
//
//  - If you want to use props (or state) in the component returned by
//    a HOC, you have to wrap the result of the HOC in a component that
//    defines the props (or state), and render the result of the HOC.
//
//  - This enables you to define components that use those props and state
//    to passed to the HOC.
//
//  - The components passed to the HOC must be *components*, not
//    not instantiations (objects); you'll need to define functional components
//    `ButtonContent` and `ModalBody` on the class, and pass those functions
//    as arguments to the HOC. Code fragment:
//
//      ButtonWithModal = buttonWithModal(this.ButtonContent, this.ModalBody);
//
//  - This is all a little complex, but logical. Is there a better way?
//
// For an example use case, see component GeoExporter.Modal.

import React from 'react';
import { Button, Modal } from 'react-bootstrap';


function buttonWithModal(ButtonContent, ModalBody) {
  return class ButtonWithModalWrapper extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        showModal: false,
      };
    }

    openModal = () => {
      this.setState({ showModal: true });
    };

    closeModal = () => {
      this.setState({ showModal: false });
    };

    render() {
      return (
        <div>
          <Button onClick={this.openModal}>
            <ButtonContent/>
          </Button>

          <Modal show={this.state.showModal} onHide={this.closeModal}>
            <ModalBody/>
          </Modal>
        </div>
      );
    }
  };
}

export default buttonWithModal;

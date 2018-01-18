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

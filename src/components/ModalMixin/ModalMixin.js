var ModalMixin = {

  getInitialState() {
    return {
      showModal: false,
    };
  },

  close() {
    this.setState({
      showModal: false,
    });
  },

  open() {
    this.setState({
      showModal: true,
    });
  },

};

export default ModalMixin;

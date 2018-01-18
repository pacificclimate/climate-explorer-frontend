import PropTypes from 'prop-types';
import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
import DialogWithError from './DialogWithError';

/*

Provides a dialog to load a local spatial file.

Calls callback with resulting geojson

*/

// TODO: Refactor as a HOC that composes the button, modal dialog, and error
// dialog from separate components. Unfortunately we are in a bit of a hurry
// and so we use a little cut-paste instead of the deprecated mixin.
// See HOCs/buttonWithModal for a start on the HOC.

class GeoLoader extends React.Component {
  static propTypes = {
    onLoadArea: PropTypes.func.isRequired,
    title: PropTypes.string,
  };

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

        <Button onClick={this.openModal} title={this.props.title}>
          <Glyphicon glyph='open-file' />
        </Button>

        <DialogWithError
          show={this.state.showModal}
          onHide={this.closeModal}
          onLoadArea={this.props.onLoadArea}
        />
      </div>
    );
  }
}

export default GeoLoader;

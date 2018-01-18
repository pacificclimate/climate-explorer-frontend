import PropTypes from 'prop-types';
import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
import DialogWithError from './DialogWithError';

import compAcontrolsB from '../../HOCs/compAcontrolsB';

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

  A = (props) =>
    <Button onClick={props.open} title={this.props.title}>
      <Glyphicon glyph='open-file'/>
    </Button>
  ;

  B = (props) =>
    <DialogWithError
      show={props.show}
      onHide={props.close}
      onLoadArea={this.props.onLoadArea}
    />
  ;

  render() {
    const ButtonWithModal = compAcontrolsB(this.A, this.B);
    return <ButtonWithModal/>;
  }
}

export default GeoLoader;

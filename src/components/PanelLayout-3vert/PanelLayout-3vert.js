import React, { PropTypes, Component } from 'react';
import { Glyphicon } from 'react-bootstrap';
import classNames from 'classnames';

import styles from './PanelLayout-3vert.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lOpen: true,
      rOpen: false
    };
  }
  static propTypes = {
    content: PropTypes.node.isRequired,
    right: PropTypes.node.isRequired,
    left: PropTypes.node.isRequired
  }

  toggleLeft() {
    this.setState({ lOpen: !this.state.lOpen });
  }

  toggleRight() {
    this.setState({ rOpen: !this.state.rOpen });
  }

  render() {
    var lClass = classNames(
      styles.sidebar,
      styles.left,
      !this.state.lOpen && styles.closed
    );

    var rClass = classNames(
      styles.sidebar,
      styles.right,
      !this.state.rOpen && styles.closed
    );

    var contentClass = classNames(
      styles.content,
      !this.state.rOpen && styles.rclosed,
      !this.state.lOpen && styles.lclosed
    );

    const glyphLeft = (
      <div className={classNames(styles.verticalAlign, styles.glyph)}>
        <Glyphicon glyph="chevron-left" /><br /><br /><Glyphicon glyph="chevron-left" />
      </div>
    );

    const glyphRight = (
      <div className={classNames(styles.verticalAlign, styles.glyph)}>
        <Glyphicon glyph="chevron-right" /><br /><br /><Glyphicon glyph="chevron-right" />
      </div>
    );

    return (
      <div>
        <div className={lClass}>
          {this.props.left}
        </div>
        <div className={classNames('control-toggle-left', styles.dragbar, styles.left, !this.state.lOpen && styles.closed)}
            onClick={this.toggleLeft.bind(this)}>
          { (this.state.lOpen ? glyphLeft : glyphRight) }
        </div>

        <div className={rClass}>
          {this.props.right}
        </div>
        <div className={classNames('control-toggle-right', styles.dragbar, styles.right, !this.state.rOpen && styles.closed)}
            onClick={this.toggleRight.bind(this)}>
          { (this.state.rOpen ? glyphRight : glyphLeft) }
        </div>
        <div className={contentClass}>
          {this.props.content}
        </div>
      </div>
    );
  }
}

export default App;

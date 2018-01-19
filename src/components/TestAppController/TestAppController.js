import React from 'react';

import _ from 'underscore';

import './TestAppController.css';
import AltMapController from '../AltMapController';


class TestAppController extends React.Component {
  // This component is a test framework for AltMapController.
  // It stubs the behaviour of existing component MapController.
  // TODO: Remove when transition to new architecture is complete

  constructor(props) {
    super(props);

    // Set up test state.
    this.state = {
      meta: [
        {
          start_date: '1950',
          end_date: '1990',
          ensemble_member: 'r1i1p1',
        },
        {
          start_date: '1950',
          end_date: '1990',
          ensemble_member: 'r2i2p2',
        },
      ],
      comparandMeta: undefined,
      area: undefined,
    };
  }

  handleSetArea = (area) => {
    console.log('handleSetArea', JSON.stringify(area, 2));
    this.setState({ area });
  };

  render() {
    return (
      <AltMapController
        meta={this.state.meta}
        comparandMeta={this.state.comparandMeta}
        area={this.state.area}
        onSetArea={this.handleSetArea}
      />
    );
  }
}

export default TestAppController;

var React = require('react');

var PanelOverlay = require('../PanelOverlay/PanelOverlay');
var Slider = require('./Slider');

var styles = {
  position: 'fixed',
  bottom: 20,
  left: 0,
  paddingLeft: 30,
  paddingRight: 30,
  paddingBottom: 5,
  marginTop: 10,
  marginBottom: 20,
  borderRadius: '0px 10px 10px 0px',
  width: 600,
  backgroundColor: '#333',
  color: '#DDD'
};

var TimeSlider = React.createClass({

  render: function () {
    return (
            <PanelOverlay title={'Timeslice Selection'} keepOpen>
                <Slider step={1} value={16}
                    ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]}
                    ticksLabels={['J', 'F', 'M', 'A', 'M', 'J ', 'J', 'A', 'S', 'O', 'N', 'D', 'DJF', 'MAM', 'JJA', 'SON', 'ANN']}
                    ticksPositions={[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 65, 72.5, 80, 87.5, 100]}
                     />
            </PanelOverlay>

        );
  }
});

module.exports = TimeSlider;

var React = require('react');

var Slider = require('../Slider');

import styles from './TimeSlider.css';

var TimeSlider = React.createClass({

  render: function () {
    return (
      <div className={styles.timeslider}>
        <Slider step={1} value={17}
          ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]}
          ticksLabels={['J', 'F', 'M', 'A', 'M', 'J ', 'J', 'A', 'S', 'O', 'N', 'D', 'DJF', 'MAM', 'JJA', 'SON', 'ANN']}
        />
      </div>
    );
  },
});

module.exports = TimeSlider;

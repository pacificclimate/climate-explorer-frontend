import React from 'react';
import { Input } from 'react-bootstrap';

var Selector = React.createClass({
  getDefaultProps: function() {
    return {
      label: "Selection",
      items: []
    };
  },

  handleChange: function(event) {
    this.props.onChange(event.target.value);
  },

  render: function() {
    return (
      <Input type="select" label={this.props.label} onChange={this.handleChange}>
      {
        this.props.items.map(function(item) {
          return Array.isArray(item) ? <option value={item[0]} key={item[0]}>{item[1]}</option> : <option value={item} key={item}>{item}</option>;
        })
      }
      </Input>
      );
  }
});



export default Selector

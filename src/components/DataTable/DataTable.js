import PropTypes from 'prop-types';
import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

class DataTable extends React.Component {
  static propTypes = {
    data: PropTypes.array,
  };

  render() {
    return (
      <div id={'table'}>
        <BootstrapTable data={this.props.data} options={this.props.options} striped hover >
          <TableHeaderColumn dataField='model_period' isKey dataAlign='center' dataSort>Averaging Period</TableHeaderColumn>
          <TableHeaderColumn dataField='run' dataAlign='center' dataSort>Model Run</TableHeaderColumn>
          <TableHeaderColumn dataField='min' dataAlign='center' dataSort>Min</TableHeaderColumn>
          <TableHeaderColumn dataField='max' dataAlign='center' dataSort>Max</TableHeaderColumn>
          <TableHeaderColumn dataField='mean' dataAlign='center' dataSort>Mean</TableHeaderColumn>
          <TableHeaderColumn dataField='median' dataAlign='center' dataSort>Median</TableHeaderColumn>
          <TableHeaderColumn dataField='stdev' dataAlign='center' dataSort>Std.Dev</TableHeaderColumn>
          <TableHeaderColumn dataField='units' dataAlign='center' dataSort>Units</TableHeaderColumn>
        </BootstrapTable>
      </div>
    );
  }
}

export default DataTable;

import React, { PropTypes, Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

var DataTable = React.createClass({

    propTypes: {
        data: React.PropTypes.array.isRequired
    },

    render: function () {
        return (
            <div id={'table'}>
                <BootstrapTable data={this.props.data} striped={true} hover={true} >
                    <TableHeaderColumn dataField="model_period" isKey={true} dataAlign="center" dataSort={true}>Model Period</TableHeaderColumn>
                    <TableHeaderColumn dataField="run" dataAlign="center" dataSort={true}>Run</TableHeaderColumn>
                    <TableHeaderColumn dataField="min" dataAlign="center" dataSort={true}>Min</TableHeaderColumn>
                    <TableHeaderColumn dataField="max" dataAlign="center" dataSort={true}>Max</TableHeaderColumn>
                    <TableHeaderColumn dataField="w_mean" dataAlign="center" dataSort={true}>W.Mean</TableHeaderColumn>
                    <TableHeaderColumn dataField="median" dataAlign="center" dataSort={true}>Median</TableHeaderColumn>
                    <TableHeaderColumn dataField="w_stdev" dataAlign="center" dataSort={true}>W.Std.Dev</TableHeaderColumn>
                    <TableHeaderColumn dataField="units" dataAlign="center" dataSort={true}>Units</TableHeaderColumn>
                </BootstrapTable>
            </div>
        )
    }
});

export default DataTable;

import React, { PropTypes, Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

var DataTable = React.createClass({

    propTypes: {
        data: React.PropTypes.array
    },

    render: function () {
        return (
            <div id={'table'}>
                <BootstrapTable data={this.props.data} striped={true} hover={true} >
                    <TableHeaderColumn dataField="model_period" isKey={true} dataAlign="center" dataSort={true}>Model Period</TableHeaderColumn>
                    <TableHeaderColumn dataField="run" dataAlign="center" dataSort={true}>Run</TableHeaderColumn>
                    <TableHeaderColumn dataField="min" dataAlign="center" dataSort={true}>Min</TableHeaderColumn>
                    <TableHeaderColumn dataField="max" dataAlign="center" dataSort={true}>Max</TableHeaderColumn>
                    <TableHeaderColumn dataField="mean" dataAlign="center" dataSort={true}>Mean</TableHeaderColumn>
                    <TableHeaderColumn dataField="median" dataAlign="center" dataSort={true}>Median</TableHeaderColumn>
                    <TableHeaderColumn dataField="stdev" dataAlign="center" dataSort={true}>Std.Dev</TableHeaderColumn>
                    <TableHeaderColumn dataField="units" dataAlign="center" dataSort={true}>Units</TableHeaderColumn>
                </BootstrapTable>
            </div>
        )
    }
});

export default DataTable;

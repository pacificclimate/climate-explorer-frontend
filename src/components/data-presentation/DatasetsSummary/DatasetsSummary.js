import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col, Glyphicon } from 'react-bootstrap';
import Accordion from '../../guidance-tools/Accordion';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { MEVSummary } from '../MEVSummary/MEVSummary';
import { filteredDatasetSummaryPanelLabel } from '../../guidance-content/info/InformationItems';
import FlowArrow from '../FlowArrow';

import _ from 'underscore';
import { HalfWidthCol } from '../../layout/rb-derived-components';


export default class DatasetsSummary extends React.Component {
  static propTypes = {
    model_id: PropTypes.string.isRequired,
    experiment: PropTypes.string.isRequired,
    variable_id: PropTypes.string.isRequired,
    comparand_id: PropTypes.string,
    meta: PropTypes.array.isRequired,
    comparandMeta: PropTypes.array.isRequired,
    dual: PropTypes.bool.isRequired,
    flowArrow: PropTypes.oneOf('none top bottom'.split()).isRequired,
  };

  static defaultProps = {
    dual: false,
    comparandMeta: null,
    flowArrow: 'none',
  };

  render() {
    const metaToKeyedData = (m) => ({
      key: `${m.ensemble_member} ${m.start_date}-${m.end_date}`,
      ...m,
    });

    const keyedDataToTableRowData = (data, key) => {
      const { ensemble_member, start_date, end_date } = data[0];
      let row = {
        id: key,
        ensemble_member,
        start_date: `${start_date}-01-01`,
        end_date: `${end_date}-12-31`,
      };
      for (const d of data) {
        row[d.timescale] = 'Yes';
      }
      return row;
    };

    const keyedData = this.props.meta.map(metaToKeyedData);
    console.log('keyedData', keyedData)
    const keyedComparandData =
      this.props.comparandMeta &&
      this.props.comparandMeta.map(metaToKeyedData);
    console.log('keyedComparandData', keyedComparandData)

    const dataGroupedByKey = _.groupBy(keyedData, 'key');
    console.log('dataGroupedByKey', dataGroupedByKey)
    const comparandDataGroupedByKey =
      keyedComparandData &&
      _.groupBy(keyedComparandData, 'key');
    console.log('comparandDataGroupedByKey', comparandDataGroupedByKey)

    const dataForTable = _.map(dataGroupedByKey, keyedDataToTableRowData);
    const comparandDataForTable =
      comparandDataGroupedByKey &&
      _.map(comparandDataGroupedByKey, keyedDataToTableRowData);

    const DataTable = ({ data }) => (
      <BootstrapTable
        data={data}
      >
        <TableHeaderColumn
          dataField='id' isKey
          width={'15%'}
        >
          Label in selectors
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField='ensemble_member'
          width={'10%'}
        >
          Model Run
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField='start_date'
          width={'10%'}
        >
          Start Date
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField='end_date'
          width={'10%'}
        >
          End Date
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField='yearly'
          width={'10%'}
        >
          Yearly?
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField='seasonal'
          width={'10%'}
        >
          Seasonal?
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField='monthly'
          width={'10%'}
        >
          Monthly?
        </TableHeaderColumn>
      </BootstrapTable>
    );

    return (
      <Accordion>
        {
          this.props.flowArrow === 'top' &&
          <FlowArrow position={this.props.flowArrow}/>
        }
        <Accordion.Item
          eventKey={2}
          title={
            <Row>
              <Col lg={2}>
                {filteredDatasetSummaryPanelLabel}
              </Col>
              <Col lg={10}>
                <MEVSummary
                  model_id={this.props.model_id}
                  experiment={this.props.experiment}
                  variable_id={this.props.variable_id}
                  comparand_id={this.props.comparand_id}
                  dual={this.props.dual}
                />
                {' '}<Glyphicon glyph='arrow-right'/>{' '}
                <span>{this.props.meta.length} datasets</span>
                {
                  this.props.dual &&
                  <span>
                    {' + '}{this.props.comparandMeta.length} datasets
                  </span>
                }
              </Col>
            </Row>
          }
        >
          <Row>
            <HalfWidthCol>
              {
                this.props.dual &&
                <p>
                  Variable 1 ({this.props.variable_id}){': '}
                  {this.props.meta.length} datasets
                </p>
              }
              <DataTable data={dataForTable}/>
            </HalfWidthCol>
            {
              this.props.dual &&
              <HalfWidthCol>
                <p>
                  Variable 2 ({this.props.comparand_id}){': '}
                  {this.props.comparandMeta.length} datasets
                </p>
                <DataTable data={comparandDataForTable}/>
              </HalfWidthCol>
            }
          </Row>
        </Accordion.Item>
        {
          this.props.flowArrow === 'bottom' &&
          <FlowArrow position={this.props.flowArrow}/>
        }
      </Accordion>
    );
  }
}

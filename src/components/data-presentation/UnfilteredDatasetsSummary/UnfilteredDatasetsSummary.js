import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Accordion from '../../guidance-tools/Accordion';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { unfilteredDatasetSummaryPanelLabel } from '../../guidance-content/info/InformationItems';

import _ from 'underscore';
import { QuarterWidthCol } from '../../layout/rb-derived-components';


export default class UnfilteredDatasetsSummary extends React.Component {
  static propTypes = {
    meta: PropTypes.array.isRequired,
  };

  render() {
    function countsByGroup(meta, grouper) {
      const groupedByPropName = _.groupBy(meta, grouper);
      const countsByPropValue = _.map(groupedByPropName, (group, key) => (
        { key, count: group.length }
      ));
      return countsByPropValue;
    }

    function startEndRunGrouper(item) {
      return `${item.start_date}-${item.end_date} ${item.ensemble_member}`;
    }

    const CountsTable = ({ title, grouper }) => (
      <BootstrapTable
        data={countsByGroup(this.props.meta, grouper)}
      >
        <TableHeaderColumn
          dataField='key' isKey
          width={'50%'}
        >
          {title}
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField='count'
          width={'50%'}
          dataAlign='right'
        >
          Number of datasets
        </TableHeaderColumn>
      </BootstrapTable>
    );

    return (
      <Accordion>
        <Accordion.Item
          eventKey={2}
          title={
            <Row>
              <Col lg={2}>
                {unfilteredDatasetSummaryPanelLabel}
              </Col>
              <Col lg={10}>
                {this.props.meta.length} datasets total
              </Col>
            </Row>
          }
        >
          <h5>Dataset counts by ...</h5>
          <Row>
            <QuarterWidthCol>
              <CountsTable grouper='model_id' title='Model'/>
            </QuarterWidthCol>
            <QuarterWidthCol>
              <CountsTable grouper='experiment' title='Emissions Scenario'/>
            </QuarterWidthCol>
            <QuarterWidthCol>
              <CountsTable grouper='variable_id' title='Variable'/>
            </QuarterWidthCol>
          </Row>
          <Row>
            <QuarterWidthCol>
              <CountsTable grouper={startEndRunGrouper} title='Start Yr - End Yr Run'/>
            </QuarterWidthCol>
            <QuarterWidthCol>
              <CountsTable grouper='timescale' title='Timsescale'/>
            </QuarterWidthCol>
            <QuarterWidthCol>
              <CountsTable grouper='multi_year_mean' title='Multi-Year Mean'/>
            </QuarterWidthCol>
          </Row>
        </Accordion.Item>
      </Accordion>
    );
  }
}

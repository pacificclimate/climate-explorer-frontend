import PropTypes from "prop-types";
import React from "react";
import { Row, Col } from "react-bootstrap";
import Accordion from "../../guidance-tools/Accordion";
import { BootstrapTable, TableHeaderColumn } from "react-bootstrap-table";
import { MEVSummary } from "../MEVSummary/MEVSummary";
import { filteredDatasetSummaryPanelLabel } from "../../guidance-content/info/InformationItems";
import { isMultiRun } from "../../map-controllers/map-helpers";

import _ from "lodash";
import { HalfWidthCol } from "../../layout/rb-derived-components";

export default class FilteredDatasetsSummary extends React.Component {
  static propTypes = {
    model_id: PropTypes.string.isRequired,
    experiment: PropTypes.string.isRequired,
    variable_id: PropTypes.string.isRequired,
    comparand_id: PropTypes.string,
    meta: PropTypes.array.isRequired,
    comparandMeta: PropTypes.array,
    dual: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    dual: false,
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
        row[d.timescale] = "Yes";
      }
      return row;
    };

    const keyedData = this.props.meta.map(metaToKeyedData);
    if (this.props.meta.length && !isMultiRun(this.props.meta)) {
      // Remove run in cases where there is only one run
      keyedData.forEach((el) => (el.key = el.key.split(" ")[1]));
    }

    const keyedComparandData =
      this.props.comparandMeta && this.props.comparandMeta.map(metaToKeyedData);
    if (
      keyedComparandData &&
      this.props.comparandMeta.length &&
      !isMultiRun(this.props.comparandMeta)
    ) {
      keyedComparandData.forEach((el) => (el.key = el.key.split(" ")[1]));
    }

    const dataGroupedByKey = _.groupBy(keyedData, "key");
    const comparandDataGroupedByKey =
      keyedComparandData && _.groupBy(keyedComparandData, "key");

    const dataForTable = _.map(dataGroupedByKey, keyedDataToTableRowData);
    const comparandDataForTable =
      comparandDataGroupedByKey &&
      _.map(comparandDataGroupedByKey, keyedDataToTableRowData);

    const DataTable = ({ data }) => (
      <BootstrapTable data={data}>
        <TableHeaderColumn dataField="id" isKey width={"15%"}>
          Label in selectors
        </TableHeaderColumn>
        <TableHeaderColumn dataField="ensemble_member" width={"10%"}>
          Model Run
        </TableHeaderColumn>
        <TableHeaderColumn dataField="start_date" width={"10%"}>
          Start Date
        </TableHeaderColumn>
        <TableHeaderColumn dataField="end_date" width={"10%"}>
          End Date
        </TableHeaderColumn>
        <TableHeaderColumn dataField="yearly" width={"10%"}>
          Annual?
        </TableHeaderColumn>
        <TableHeaderColumn dataField="seasonal" width={"10%"}>
          Seasonal?
        </TableHeaderColumn>
        <TableHeaderColumn dataField="monthly" width={"10%"}>
          Monthly?
        </TableHeaderColumn>
      </BootstrapTable>
    );

    return (
      <Accordion>
        <Accordion.Item
          eventKey={2}
          title={
            <Row>
              <Col lg={2}>{filteredDatasetSummaryPanelLabel}</Col>
              <Col lg={10}>
                <MEVSummary
                  model_id={this.props.model_id}
                  experiment={this.props.experiment}
                  variable_id={this.props.variable_id}
                  comparand_id={this.props.comparand_id}
                  dual={this.props.dual}
                />
                {" \u27F6 "}
                <span>{this.props.meta.length} datasets</span>
                {this.props.dual && (
                  <span>
                    {" + "}
                    {this.props.comparandMeta.length} datasets
                  </span>
                )}
              </Col>
            </Row>
          }
        >
          <Row>
            <HalfWidthCol>
              {this.props.dual && (
                <p>
                  Variable 1 ({this.props.variable_id}){": "}
                  {this.props.meta.length} datasets
                </p>
              )}
              <DataTable data={dataForTable} />
            </HalfWidthCol>
            {this.props.dual && (
              <HalfWidthCol>
                <p>
                  Variable 2 ({this.props.comparand_id}){": "}
                  {this.props.comparandMeta.length} datasets
                </p>
                <DataTable data={comparandDataForTable} />
              </HalfWidthCol>
            )}
          </Row>
        </Accordion.Item>
      </Accordion>
    );
  }
}

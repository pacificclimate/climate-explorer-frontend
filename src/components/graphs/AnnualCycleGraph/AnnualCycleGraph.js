import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col } from 'react-bootstrap';

import DatasetSelector from '../../DatasetSelector/DatasetSelector';
import DataGraph from '../../DataGraph/DataGraph';
import ExportButtons from '../ExportButtons';


export default class AnnualCycleGraph extends React.Component {
  static propTypes = {
    meta: PropTypes.array,
    dataset: PropTypes.object,
    onChangeDataset: PropTypes.func.isRequired,
    graphSpec: PropTypes.object,
    onExportXslx: PropTypes.func.isRequired,
    onExportCsv: PropTypes.func.isRequired,
  };

  render() {
    return (
      <React.Fragment>
        <Row>
          <Col lg={4} lgPush={8} md={6} mdPush={6} sm={6} smPush={6}>
            <DatasetSelector
              meta={this.props.meta}
              // TODO: Refactor to eliminate encoding of dataset.
              value={JSON.stringify(this.props.dataset)}
              onChange={this.props.onChangeDataset}
            />
          </Col>
          <Col lg={4} lgPush={1} md={6} mdPush={1} sm={6} smPush={1}>
            <ExportButtons
              onExportXslx={this.props.onExportXslx}
              onExportCsv={this.props.onExportCsv}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <DataGraph
              data={this.props.graphSpec.data}
              axis={this.props.graphSpec.axis}
              tooltip={this.props.graphSpec.tooltip}
            />
          </Col>
        </Row>
      </React.Fragment>
    );
  }
}

import PropTypes from 'prop-types';
import React from 'react';
import { Row, Col } from 'react-bootstrap';

import TimeOfYearSelector from '../../Selector/TimeOfYearSelector';
import DataGraph from '../../DataGraph/DataGraph';
import ExportButtons from '../ExportButtons';


export default class LongTermAveragesGraph extends React.Component {
  static propTypes = {
    timeOfYear: PropTypes.string,
    onChangeTimeOfYear: PropTypes.func.isRequired,
    graphSpec: PropTypes.object,
    onExportXslx: PropTypes.func.isRequired,
    onExportCsv: PropTypes.func.isRequired,
  };

  render() {
    return (
      <React.Fragment>
        <Row>
          <Col lg={4} lgPush={8} md={6} mdPush={6} sm={6} smPush={6}>
            <TimeOfYearSelector
              value={this.props.timeOfYear}
              onChange={this.props.onChangeTimeOfYear}
            />
          </Col>
          <Col>
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

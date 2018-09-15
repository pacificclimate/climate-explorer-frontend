import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';

export default function ClimateExplorer() {
  return (
    <Grid fluid>
      <h1>Climate Explorer</h1>
      <p>Version {CE_CURRENT_VERSION}</p>
      <Row>
        <Col lg={6}>
          <p>
            Climate Explorer: tool for visualizing and downloading
            climate model data for the B.C. - Yukon region.
          </p>
          <p>
            Also fondly known as "the Marmot," in reference to the predecessor
            tool, the Regional Analysis Tool, or "RAT."
          </p>
        </Col>
        <Col lg={6}>
        </Col>
      </Row>
    </Grid>
  );
}

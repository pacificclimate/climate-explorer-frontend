import React from 'react';
import { Grid } from 'react-bootstrap';

export default function ClimateExplorer() {
  return (
    <Grid fluid>
      <h1>Climate Explorer</h1>
      <p>Version: {CE_CURRENT_VERSION}</p>
    </Grid>
  );
}

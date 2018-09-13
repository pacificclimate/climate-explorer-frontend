import React from 'react';
import { Link } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import LabelWithInfo from '../../guidance-tools/LabelWithInfo';

// Selector labels

export const modelSelectorLabel = (
  <LabelWithInfo label='Model'>
    <p>
      GCM model with which the climate data was generated.
    </p>
    <p>
      Models are identified by short codes. For full model identification,
      see <Link to='/help/general'>Help</Link>.
    </p>
  </LabelWithInfo>
);

export const emissionScenarioSelectorLabel = (
  <LabelWithInfo label='Emission Scenario'>
    <p>Emission scenario used to drive the model run.</p>
    <p>
      Emission scenarios use the following coding:
      <Table condensed>
        <thead>
          <tr>
            <th>Code</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>historical</td>
            <td>Emission values based on historical records</td>
          </tr>
          <tr>
            <td>rcp26</td>
            <td><a href='http://www.iiasa.ac.at/web-apps/tnt/RcpDb/dsd?Action=htmlpage&page=welcome' target='_blank'>RCP</a> 2.6</td>
          </tr>
          <tr>
            <td>rcp45</td>
            <td><a href='http://www.iiasa.ac.at/web-apps/tnt/RcpDb/dsd?Action=htmlpage&page=welcome' target='_blank'>RCP</a> 4.5</td>
          </tr>
          <tr>
            <td>rcp85</td>
            <td><a href='http://www.iiasa.ac.at/web-apps/tnt/RcpDb/dsd?Action=htmlpage&page=welcome' target='_blank'>RCP</a> 8.5</td>
          </tr>
        </tbody>
      </Table>
    </p>
  </LabelWithInfo>
);

export const variableSelectorLabel = (
  <LabelWithInfo label='Variable'>
    Variable to view on the map and in the graphs.
    The variable is represented in the map as a grid of coloured blocks
    overlaid on the map.
  </LabelWithInfo>
);

export const variable1SelectorLabel = (
  <LabelWithInfo label='Variable 1 (Colour blocks)'>
    First or 'primary' variable to view.
    This variable is represented in the map as a grid of coloured blocks
    overlaid on the map.
  </LabelWithInfo>
);

export const variable2SelectorLabel = (
  <LabelWithInfo label='Variable 2 (Isolines)'>
    Second or 'secondary' variable to view.
    This variable is represented in the map as a set of isolines
    (contours of export constant value) overlaid on the map.
  </LabelWithInfo>
);

// Graph tab labels

const annualCycleGraphDefn = `
  An annual cycle graph presents spatially averaged values of a multi-year 
  mean dataset as points over a nominal year (representing the "average" year).
  Horizontal axis indicates time point within representative year.
`;

const spatialAveragingDefn = `
  Values are spatially averaged over the area selected by the polygon
  drawn on the map (or over the entire dataset if no polygon is drawn).
`;

const datasetSelectorDefn = `
  Model run and averaging period are selected by the Dataset selector
  in the graph.
`;

const timeOfYearSelectorDefn = `
  Month, season, or annual average is selected by the Time of Year
  selector in the graph.
`;

export const singleAnnualCycleTabLabel = (
  <LabelWithInfo label='Annual Cycle'>
    <p>
      Annual cycle graph showing the yearly, seasonal, and monthly
      mean values of the selected variable.
    </p>
    <p>{annualCycleGraphDefn}</p>
    <p>{spatialAveragingDefn}</p>
    <p>{datasetSelectorDefn}</p>
  </LabelWithInfo>
);

export const dualAnnualCycleTabLabel = (
  <LabelWithInfo label='Annual Cycle'>
    Annual cycle graphs showing the yearly, seasonal, and monthly
    mean values of the two selected variables (if different).
    <p>{annualCycleGraphDefn}</p>
    <p>{spatialAveragingDefn}</p>
    <p>{datasetSelectorDefn}</p>
  </LabelWithInfo>
);

const ltaGraphDefn = `
  A long term average graph presents the monthly, seasonal, or annual average 
  value, taken over a several different multi-decade period, of the 
  selected variable.
  Horizontal axis indicates midpoint of multi-decade averaging period.
`;

export const singleLtaTabLabel = (
  <LabelWithInfo label='Long Term Average'>
    <p>Long term average graphs for the selected variable.</p>
    <p>{ltaGraphDefn}</p>
    <p>{spatialAveragingDefn}</p>
    <p>{timeOfYearSelectorDefn}</p>
  </LabelWithInfo>
);

export const dualLtaTabLabel = (
  <LabelWithInfo label='Long Term Average'>
    Long term average graphs for the two selected variables (if different).
    <p>{ltaGraphDefn}</p>
    <p>{spatialAveragingDefn}</p>
    <p>{timeOfYearSelectorDefn}</p>
  </LabelWithInfo>
);

export const modelContextTabLabel = (
  <LabelWithInfo label='Model Context'>
    <p>
      Graph of average value of the selected value, taken over a multi-decade
      period, for each model and run available for the selected emission scenario
      and variable.
      The selected model run is highlighted. This puts the selected model into
      context with other similar model runs.
    </p>
    <p>{spatialAveragingDefn}</p>
</LabelWithInfo>
);

export const futureAnomalyTabLabel = (
  <LabelWithInfo label='Future Anomaly'>
    <p>
      Annual cycle graphs showing anomaly (difference from average over
      baseline period)
      for averages over near-term (2010-2039) and future (2040-2069, 2070-2099)
      periods.
    </p>
    <p>{annualCycleGraphDefn}</p>
    <p>{spatialAveragingDefn}</p>
  </LabelWithInfo>
);

export const snapshotTabLabel = (
  <LabelWithInfo label='Snapshot'>
    <p>
      Shows all model results at a single point in time, for the selected variable
      and emissions scenario, with the selected model highlighted.
    </p>
    <p>{spatialAveragingDefn}</p>
  </LabelWithInfo>
);

export const timeSeriesTabLabel = (
  <LabelWithInfo label='Time Series'>
    <p>Simple graph of data values against time.</p>
    <p>{spatialAveragingDefn}</p>
  </LabelWithInfo>
);

export const variableResponseTabLabel = (
  <LabelWithInfo label='Variable Response'>
    <p>
      This graph shows the influnce of the secondary variable
      on the primary variable irrespective of time.
    </p>
    <p>
      It is composed from timeseries data with matching availability for
      both variables. Each point in time t with data from both variables
      (t, primary(t)) and (t, secondary(t)) appears as the scatterplot point
      (secondary(t), primary(t)).
    </p>
    <p>
      The secondary variable appears along the x axis as the explanatory
      variable; the primary variable appears along the y axis as the
      response variable.
    </p>
    <p>{spatialAveragingDefn}</p>
  </LabelWithInfo>
);

export const template = (
  <LabelWithInfo label=''>
    info
  </LabelWithInfo>
);

import React from 'react';
import { Link } from 'react-router-dom';
import LabelWithInfo from './LabelWithInfo';

export const modelSelectorLabel = (
  <LabelWithInfo label='Model'>
    GCM model with which the climate data was generated.
    Kan we haz <Link to={'/help'}>link</Link>?
  </LabelWithInfo>
);

export const emissionScenarioSelectorLabel = (
  <LabelWithInfo label='Emission Scenario'>
    Emission scenario used to drive the model run
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
    First variable to view.
    This variable is represented in the map as a grid of coloured blocks
    overlaid on the map.
  </LabelWithInfo>
);

export const variable2SelectorLabel = (
  <LabelWithInfo label='Variable 2 (Isolines)'>
    Second variable to view.
    This variable is represented in the map as a set of isolines
    (contours of export constant value) overlaid on the map.
  </LabelWithInfo>
);

export const annualCycleTabLabel = (
  <LabelWithInfo label='Annual Cycle'>
    Graph of a representative "year" with the yearly, seasonal, and monthly
    mean values of the selected variable, taken over a multi-decade period.
    Horizontal axis indicates time point within representative year.
    Values are spatially averaged over the area selected by the polygon
    drawn on the map (or over the entire dataset if no polygon is drawn).
    Model run and averaging period are selected by the Dataset selector
    in the graph.
  </LabelWithInfo>
);

export const ltaTabLabel = (
  <LabelWithInfo label='Long Term Average'>
    Graph of the monthly, seasonal, or annual average value of the selected
    variable, taken over a multi-decade period.
    Horizontal axis indicates midpoint of multi-decade averaging period.
    Values are spatially averaged over the area selected by the polygon
    drawn on the map (or over the entire dataset if no polygon is drawn).
    Month, season, or annual average is selected by the Time of Year
    selector in the graph.
  </LabelWithInfo>
);

export const modelContextTabLabel = (
  <LabelWithInfo label='Model Context'>
     Graph of average value of the selected value, taken over a multi-decade
    period, for each model and run available for the selected emission scenario
    and variable.
    The selected model run is highlighted. This puts the selected model into
    context with other similar model runs.
    Values are spatially averaged over the area selected by the polygon
    drawn on the map (or over the entire dataset if no polygon is drawn).
</LabelWithInfo>
);

export const futureAnomalyTabLabel = (
  <LabelWithInfo label='Future Anomaly'>
    Future Anomaly info
  </LabelWithInfo>
);

export const snapshotTabLabel = (
  <LabelWithInfo label='Snapshot'>
    Snapshot info
  </LabelWithInfo>
);

export const timeSeriesTabLabel = (
  <LabelWithInfo label='Time Series'>
    Time Series info
  </LabelWithInfo>
);

export const variableResponseTabLabel = (
  <LabelWithInfo label='Variable Response'>
    Variable Response info
  </LabelWithInfo>
);

export const template = (
  <LabelWithInfo label=''>
    info
  </LabelWithInfo>
);

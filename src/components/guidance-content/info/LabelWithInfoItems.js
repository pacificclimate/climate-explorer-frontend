// Central resource for LabelWithInfo and Information items used throughout
// the app.

import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Glyphicon, Table } from 'react-bootstrap';
import LabelWithInfo from '../../guidance-tools/LabelWithInfo';
import Information from '../../guidance-tools/Information';

///////////////////////////////
// Selectors
///////////////////////////////

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
      Emission scenarios represent a range of possible future projections for
      greenhouse gas emissions, which are input into climate models.
      Higher RCP values represent greater projected greenhouse gas emissions.
    </p>
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

const downloadFormats = `
  Data may be downloaded in Microsoft Excel compatible format (XSLX)
  or in Comma Separated Values (CSV) format.
  For details on these formats, see <Link to='/help/general'>Help</Link>.
`;

export const downloadDataLabel = (
  <LabelWithInfo label='Download Data'>
    <p>
      Click a button to download the selected data to your computer.
    </p>
    <p>
      The data downloaded is that shown on the graph.
      For details on the layout and content of the exported data,
      see <Link to='/help/general'>Help</Link>.
    </p>
    <p>{downloadFormats}</p>
  </LabelWithInfo>
);

const colourBlocksVariable = `
  This variable is represented in the map as a grid of coloured blocks
  overlaid on the map.
`;

const isolinesVariable = `
  This variable is represented in the map as a set of isolines
  (contours of constant value) overlaid on the map.
`;

export const variableSelectorLabel = (
  <LabelWithInfo label='Variable'>
    <p>Variable to view on the map and in the graphs.</p>
    <p>{colourBlocksVariable}</p>
  </LabelWithInfo>
);

export const variable1SelectorLabel = (
  <LabelWithInfo label='Variable 1 (Colour blocks)'>
    <p>First or 'primary' variable to view.</p>
    <p>{colourBlocksVariable}</p>
  </LabelWithInfo>
);

export const variable2SelectorLabel = (
  <LabelWithInfo label='Variable 2 (Isolines)'>
    <p>Second or 'secondary' variable to view.</p>
    <p>{isolinesVariable}</p>
  </LabelWithInfo>
);


export const datasetSelectorLabel = (
  <LabelWithInfo label='Dataset'>
    <p>
      Select a single dataset to display from all of those that match the Model,
      Emissions Scenario, and Variable selected.
    </p>
    <p>
      The map and the graph(s) have independently selected datasets.
      That is, they may be displaying different datasets simultaneously.
    </p>
    <p>
      On the map, use the {mapSettingsButton} button to access the Dataset selector.
      The selected dataset is shown in the legend in the lower left of the map.
    </p>
    <p>
      On the graph(s), the Dataset selector appears directly above the graph.
    </p>
    <p>
      Datasets are identified by a combination of
      model run id (e.g., <code>r1i1p1</code>) and
      averaging period (e.g., <code>1961-1990</code>).
    </p>
  </LabelWithInfo>
);

export const timeOfYearSelectorLabel = (
  <LabelWithInfo label='Time of Year'>
    <p>
      Select the portion of the year over which data values are averaged
      before being averaged over a multi-decadal period.
    </p>
  </LabelWithInfo>
);

///////////////////////////////
// Map
///////////////////////////////

const mapSettingsButton = (
  <span>
    Map Settings
    <Button bsSize='small'><Glyphicon glyph='menu-hamburger'/></Button>
  </span>
);

export const mapPanelLabel = (
  <LabelWithInfo label='Data Map'>
     <p>
       Map displaying data selected by
       Model, Emission Scenario, and Variable(s).
     </p>
     <p>
       The specific dataset displayed is selected in the Dataset selector
       accessed through the {mapSettingsButton} button.
       The selected dataset is shown in the legend in the lower left of the map.
     </p>
    <p><em>TBD: More about Map Settings and other controls.</em></p>
  </LabelWithInfo>
);

///////////////////////////////
// Graphs
///////////////////////////////

const annualCycleGraphDefn = `
  An annual cycle graph presents spatially averaged values of a multi-year 
  mean dataset as points over a nominal year (representing the "average" year).
  Horizontal axis indicates time point within representative year.
`;

const spatialAveragingDefn = `
  Data values shown in each graph are spatially averaged over the area 
  selected by the polygon
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

export const graphsPanelLabel = (
  <LabelWithInfo label='Data Graphs'>
    <p>
      Graphs showing various slices and views of the dataset(s)
      selected by Model, Emission Scenario, and Variable(s).
    </p>
    <p>{spatialAveragingDefn}</p>
  </LabelWithInfo>
);

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
  A long term average graph presents average values of the selected variable
  for the selected month, season, or the year, averaged
  over several different multi-decade period. 
  There is one data point per mulit-decade averaging period.
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


const t = <em>t</em>;
const V1 = <span>V<sub>1</sub></span>;
const V2 = <span>V<sub>2</sub></span>;

export const variableResponseTabLabel = (
  <LabelWithInfo label='Variable Response'>
    <p>
      This graph shows the influnce of the secondary variable
      on the primary variable irrespective of time.
    </p>
    <p>
      It is composed from timeseries data with matching availability for
      both variables. Each point in time {t} with data from each variable
      ({t}, {V1}({t})) and ({t}, {V2}({t}))
      appears as the scatterplot point
      ({V2}({t}), {V1}({t})).
    </p>
    <p>
      The secondary variable appears along the x axis as the explanatory
      variable; the primary variable appears along the y axis as the
      response variable.
    </p>
    <p>{spatialAveragingDefn}</p>
  </LabelWithInfo>
);


///////////////////////////////
// Stats table
///////////////////////////////

export const statsTableLabel = (
  <LabelWithInfo label='Statistical Summary'>
    <p>
      This table presents a statistical summary of all the datasets matching
      the selected Model, Emissions Scenario, and Variable.
    </p>
    <p>
      The matching datasets are identified by Averaging Period and Model Run.
    </p>
    <p>{spatialAveragingDefn}</p>
    <p>
      The data statistically summarized for a selected subperiod (Time of Year)
      within the averaging period.
    </p>
  </LabelWithInfo>
);

export const statsTableExportButtonsInfo = (
  <Information>
    <p>
      Click a button to export the contents of the statistical summary table.
    </p>
    <p>{downloadFormats}</p>
  </Information>
);

// export const infoTemplate = (
//   <Information>
//     <p>
//     </p>
//   </Information>
// );

// export const labelTemplate = (
//   <LabelWithInfo label=''>
//     <p>
//     </p>
//   </LabelWithInfo>
// );


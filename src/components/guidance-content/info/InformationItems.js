// Central resource for LabelWithInfo and Information items used throughout
// the app.

import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Glyphicon, Table } from 'react-bootstrap';
import LabelWithInfo from '../../guidance-tools/LabelWithInfo';
import Information from '../../guidance-tools/Information';
import css from './InformationItems.css';

///////////////////////////////
// Parts for building items
///////////////////////////////


///////////////////////////////
// Contact info
///////////////////////////////

export const appContact = {
  email: 'mailto:rglover@uvic.ca',
  name: 'Rod Glover',
};


///////////////////////////////
// Dataset filters (Model, Emission, Variable)
///////////////////////////////

export const datasetFilterPanelLabel = (
  <LabelWithInfo label='Dataset Filter'>
    <p>
      This filter determines which datasets can be displayed.
    </p>
    <p>
      Datasets matching these filter criteria can be displayed in the
      map, on graphs, and in a statistical summary table.
      Within each such presentation of data, you can independently select
      which of the matching datasets to display.
    </p>
  </LabelWithInfo>
);

export const modelSelectorLabel = (
  <LabelWithInfo label='Model'>
    <p>
      GCM model with which the climate data was generated.
    </p>
    <p>
      A <
      a href='http://www.ipcc-data.org/guidelines/pages/gcm_guide.html'
        target='_blank'
      >GCM
      (General Circulation Model)</a> is
      a numerical model representing
      physical processes in the atmosphere, ocean, cryosphere and land surface
      of the Earth.
      GCMs are the most advanced tools currently available for simulating the
      response of the global climate system to increasing greenhouse gas
      concentrations.
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

///////////////////////////////
// Dataset summary
///////////////////////////////

export const filteredDatasetSummaryPanelLabel = (
  <LabelWithInfo label='Filtered Dataset Summary'>
    <p>Summary listing of all datasets selected by dataset filter criteria.</p>
    <p>
      Each row of the table represents a group of up to 3 datasets.
      We group datasets by Model Run, Start Date and End Date,
      and each such group is labelled accordingly as shown in the
      "Label in selectors" column.
    </p>
    <p>
      The "Yearly", "Seasonal", and "Monthly" columns indicate whether a
      dataset with that timescale (averaging period) is available in the
      group.
    </p>
  </LabelWithInfo>
);

///////////////////////////////
// Dataset selectors
///////////////////////////////

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
      On the map, use the {mapSettingsControl} to access the Dataset selector.
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
      before those portion averages are averaged over a multi-decadal period.
    </p>
  </LabelWithInfo>
);

///////////////////////////////
// Export/download controls
///////////////////////////////

const downloadFormats = (<span>
  Data may be downloaded in Microsoft Excel compatible format (XSLX)
  or in Comma Separated Values (CSV) format.
  For details on these formats, see <Link to='/help/general'>Help</Link>.
</span>);

const exportDataLabel = 'Export Data';

export const downloadGraphDataLabel = (
  <LabelWithInfo label={exportDataLabel}>
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

export const xslxButtonLabel = 'XSLX';
export const csvButtonLabel = 'CSV';


///////////////////////////////
// Map
///////////////////////////////

const LeafletControlContainer = ({ children }) => (
  <span className='leaflet-touch'>
      <span className='leaflet-control-container'>
        {children}
      </span>
    </span>
);

const mapSettingsControl = (
  <span>
    <Button bsSize='small'><Glyphicon glyph='menu-hamburger'/></Button> {' '}
    (Map Settings)
  </span>
);

const mapZoomControls = (
  <span>
    <LeafletControlContainer>
        <span className='leaflet-control-zoom leaflet-bar leaflet-control'>
          <a className='leaflet-control-zoom-in' href='#'>+</a>
          <a className='leaflet-control-zoom-out' href='#'>-</a>
        </span>
    </LeafletControlContainer>
    {' '}
    (Zoom In/Out)
  </span>
);

const mapPolygonDrawControls = (
  <span>
    <LeafletControlContainer>
      <div className='leaflet-draw leaflet-control'>
        <div className='leaflet-draw-section'>
          <div className='leaflet-draw-toolbar leaflet-bar leaflet-draw-toolbar-top'>
            <a className='leaflet-draw-draw-polygon' href='#' title='Draw a polygon'>
              <span className='sr-only'>Draw a polygon</span>
            </a>
            <a className='leaflet-draw-draw-rectangle' href='#' title='Draw a rectangle'>
              <span className='sr-only'>Draw a rectangle</span>
            </a>
          </div>
        </div>
      </div>
    </LeafletControlContainer>
    {' '}
    (Draw Polygon/Rectangle)
  </span>
);

const mapPolygonEditControls = (
  <span>
    <LeafletControlContainer>
      <div className='leaflet-draw leaflet-control'>
        <div className='leaflet-draw-section'>
          <div className='leaflet-draw-toolbar leaflet-bar leaflet-draw-toolbar-top'>
            <a className='leaflet-draw-edit-edit' href='#' title='Edit layers'>
              <span className='sr-only'>Edit layers</span>
            </a>
            <a className='leaflet-draw-edit-remove' href='#' title='Delete layers'>
              <span className='sr-only'>Delete layers</span>
            </a>
          </div>
        </div>
      </div>
    </LeafletControlContainer>
    {' '}
    (Edit/Delete Polygon)
  </span>
);

const mapPolygonImportExportControls = (
  <span>
    <Button bsSize='small'><Glyphicon glyph='open-file'/></Button> {' '}
    <Button bsSize='small'><Glyphicon glyph='save-file'/></Button> {' '}
    (Polygon Import/Export)
  </span>
);

const mapColourScaleControls = (
  <span>
    (Colour Scale Bar)
  </span>
);

const mapAutoScaleControl = (
  <span>
    <Button bsSize='small'>
      <span style={{ fontWeight: 'bold' }}>AS</span>
    </Button> {' '}
    (Auto-Scale)
  </span>
);

export const mapPanelLabel = (
  <LabelWithInfo label='Data Map'>
     <p>
       Map displaying data selected by
       Model, Emission Scenario, and Variable(s).
     </p>
    <p>
      Summary of map tools and other controls.
      (For details, see <Link to='/help/general'>Help</Link>.)
    </p>
    <ul className={css.controlsList}>
      <li>
        {mapZoomControls}: Zoom map in and out.
      </li>
      <li>
        {mapPolygonDrawControls}: Draw polygons on the map.
        Polygons determine the extents over which spatial data averaging is
        performed.
      </li>
      <li>
        {mapPolygonEditControls}: Edit and delete polygons on the map.
        Polygons determine the extents over which spatial data averaging is
        performed.
      </li>
      <li>
        {mapPolygonImportExportControls}: Import and export polygons on the map.
        Polygons determine the extents over which spatial data averaging is
        performed.
      </li>
      <li>
        {mapSettingsControl}: Select which dataset(s) are displayed and how.
      </li>
      <li>
        {mapColourScaleControls}: Displays data value ⇄ colour mapping.
      </li>
      <li>
        {mapAutoScaleControl}: Sets bounds of data value ⇄ colour mapping to
        current range of data.
      </li>
    </ul>
  </LabelWithInfo>
);

// The following items are rendered in the Map Settings dialog.
// Using <Link/> components in the body cause the info popup not to appear.
// Specific cause unknown. Avoid them in these items.

export const TimeSelectorLabel = ({ temporalLabelPart }) => (
  <LabelWithInfo label={temporalLabelPart}>
    <p>
      Select the portion of the year over which data values are averaged
      before those portion averages are averaged over a multi-decadal period.
    </p>
  </LabelWithInfo>
);

export const paletteSelectorLabel = (
  <LabelWithInfo label={`${name} Colour Palette`}>
    <p>
      Select the set of colours to which data values are mapped
      for representation on the map.
    </p>
  </LabelWithInfo>
);

export const colourMapTypeSelectorLabel = (
  <LabelWithInfo label='Colour Map Type'>
    <p>
      Select how data values are mapped to colours.
      For details on linear and logarithmic mappings,
      see Help.
    </p>
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
  over several different multi-decade periods. 
  There is one data point per multi-decade averaging period.
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
    <p>
      Statistics are computed for averages of portions of the year selected
      by Time Of Year, which portions are then averaged over the averaging period.
    </p>
    <p>{spatialAveragingDefn}</p>
    <p>
      The table can be sorted by column content.
    </p>
    <ul>
      <li>Small triangles in column headings indicate sortable columns.</li>
      <li>A single darker triangle indicates the current sort column.</li>
      <li>Click on a column to sort by it.</li>
      <li>Click on the sort column to change the direction of sorting.</li>
    </ul>
  </LabelWithInfo>
);

export const exportStatsTableDataLabel = (
  <LabelWithInfo label={exportDataLabel}>
    <p>
      Click a button to export the contents of the statistical summary table.
    </p>
    <p>
      The data downloaded is that shown in the table.
      For details on the layout and content of the exported data,
      see <Link to='/help/general'>Help</Link>.
    </p>
    <p>{downloadFormats}</p>
  </LabelWithInfo>
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


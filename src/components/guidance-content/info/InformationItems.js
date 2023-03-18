// Central resource for LabelWithInfo and Information items used throughout
// the app.

import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Glyphicon, Table } from 'react-bootstrap';
import LabelWithInfo from '../../guidance-tools/LabelWithInfo';
import Information from '../../guidance-tools/Information';
import css from './InformationItems.module.css';

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
      Model, Emissions scenario, and Variable(s).
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

export const PaletteSelectorLabel = ({ name }) => (
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

export const gcmDefn = (<span>
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

</span>);

export const modelSelectorLabel = (
  <LabelWithInfo label='Model'>
    <p>
      GCM model with which the climate data was generated.
    </p>
    <p>
    </p>{gcmDefn}<p>
      Models are identified by short codes. For full model identification,
      see <Link to='/help/general'>Help</Link>.
    </p>
  </LabelWithInfo>
);

export const emissionScenarioSelectorLabel = (
  <LabelWithInfo label='Emissions Scenario'>
    <p>Emissions scenario used to drive the model run.</p>
    <p>
      Emissions scenarios represent a range of possible future projections for
      greenhouse gas emissions, which are input into climate models.
      Higher RCP/SSP values represent greater projected greenhouse gas emissions. RCP and SSP scenarios are used for CMIP5 and CMIP6 experiments respectively.
    </p>
    <p>
      Emissions scenarios use the following coding.
      Note that all scenarios include <code>historical</code>,
      coupled with one of the future RCP/SSP emissions scenarios.
      For example <code>historical, rcp85</code> indicates an emissions
      scenario that uses historical data up to roughly the date of the
      model run, followed by the RCP 8.5 future emissions scenario from
      then until the final date of the model run.
    </p>
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
        <td>
          Emission values based on historical records up to the "present day"
          of the model run.
        </td>
      </tr>
      <tr>
        <td>rcp26/ssp126</td>
        <td>
          <a href='https://climate-scenarios.canada.ca/?page=scen-rcp' target='_blank'>RCP</a> 2.6 / <a href='https://climate-scenarios.canada.ca/?page=cmip6-overview-notes' target='_blank'>SSP</a> 1-2.6 (very low emissions).
        </td>
      </tr>
      <tr>
        <td>rcp45/ssp245</td>
        <td>
          <a href='https://climate-scenarios.canada.ca/?page=scen-rcp' target='_blank'>RCP</a> 4.5 / <a href='https://climate-scenarios.canada.ca/?page=cmip6-overview-notes' target='_blank'>SSP</a> 2-4.5 (moderate emissions, below current levels).
        </td>
      </tr>
      <tr>
        <td>rcp85/ssp585</td>
        <td>
          <a href='https://climate-scenarios.canada.ca/?page=scen-rcp' target='_blank'>RCP</a> 8.5  / <a href='https://climate-scenarios.canada.ca/?page=cmip6-overview-notes' target='_blank'>SSP</a> 5-8.5 ("business as usual"; high emissions).
          This is the most appropriate sceanario to select for future planning.
        </td>
      </tr>
      </tbody>
    </Table>
  </LabelWithInfo>
);

const colourBlocksVariable = `
  This variable is represented in the map as a raster (grid of coloured blocks)
  overlaid on the map.
`;

const isolinesVariable = `
  This variable is represented in the map as a set of isolines
  (contours of constant value) overlaid on the map.
`;

export const variableSelectorLabel = (
  <LabelWithInfo label='Variable'>
    <p>Variable to view on the map and in the graphs. For variable details, see <Link to='/help/general'>Help</Link>.</p>
    <p>{colourBlocksVariable}</p>
  </LabelWithInfo>
);

export const variable1SelectorLabel = (
  <LabelWithInfo label='Variable 1 (Raster)'>
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
// Dataset summaries
///////////////////////////////

export const unfilteredDatasetSummaryPanelLabel = (
  <LabelWithInfo label='All Datasets Summary'>
    <p>Summary listing of all datasets available on this portal.</p>
    <p>
    </p>
    <p>
    </p>
  </LabelWithInfo>
);

export const filteredDatasetSummaryPanelLabel = (
  <LabelWithInfo label='Filtered Datasets Summary'>
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
      On the map, use the {mapSettingsControl} button to access the Dataset selector.
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

const pointAreaDefn = `
  Data values shown in each graph are from the single grid square selected
  on the map (or averaged over the entire dataset if no point is selected).
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
      selected by Model, Emissions scenario, and Variable(s).
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

export const percentileLtaTabLabel = (
  <LabelWithInfo label='Long Term Average'>
    <p>Long term average graphs with percentile range for the selected variable.</p>
    <p>{ltaGraphDefn}</p>
    <p>{pointAreaDefn}</p>
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
      period, for each model and run available for the selected Emissions scenario
      and variable.
      The selected model run is highlighted. This puts the selected model into
      context with other similar model runs.
    </p>
    <p>{spatialAveragingDefn}</p>
  </LabelWithInfo>
);

export const changeFromBaselineTabLabel = (
  <LabelWithInfo label='Change from Baseline'>
    <p>
      Annual cycle graphs showing the difference from values in baseline period
      for averages over variable values the future periods
      2010-2039, 2040-2069, and 2070-2099.
      Baseline is the average over the period 1981-2010.
    </p>
    <p>
      Absolute values, including baseline, are shown in upper graphs.
      Scale for absolute values is on left-hand vertical axis.
    </p>
    <p>
      Change from baseline, expressed as percentages, are shown in lower graphs.
      Scale for % change values is on right-hand vertical axis.
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



    .
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

///////////////////////////////
// Watershed table
///////////////////////////////
export const watershedTableLabel = (
  <LabelWithInfo label='Watershed Upstream Of Selected Point'>
    <p>
      This table presents information about the selected grid and its upstream area
      or watershed. The table is only populated if an outlet location has been
      selected on the map.
    </p>
    <p>
      The Outlet Latitude and Longitude describe the point selected on the map,
      which defines the outlet of the watershed. The Source Elevation and Outlet
      Elevation are the minimum and maximum elevation of the watershed. The Area
      is the drainage area of the watershed, upstream of the selected point.
      The Melton Ratio is defined as the relief (maximum minus minimum elevation),
      over the watershed, divided by the square root of its drainage area.
    </p>
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

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Grid, Row, ListGroup, ListGroupItem
} from 'react-bootstrap';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import overviewImg from '../../../assets/overview.png';

export default function HelpGeneral() {
  return (
    <Grid fluid>
      <Row>
        <FullWidthCol>
          <h1>Help: General</h1>
        </FullWidthCol>
      </Row>

      <Row>
        <HalfWidthCol>
          <p>
            Please forgive the partial and scattered content in this
            section. This is a work in progress.
            <Link to='/about/contact'>Feedback and suggestions</Link> are always welcome!
          </p>
        </HalfWidthCol>
      </Row>

      <Row>
        <HalfWidthCol>

          <h2>Overview</h2>
          <h3>What it is</h3>
          <p>Climate Explorer is an interactive web application that runs in
            your browser. It displays data derived from climate models in a
            variety of ways, including maps, graphs and data tables.</p>
          <h3>Purpose</h3>
          <p>Climate Explorer’s purpose is to help you do the following
            things:</p>
          <ul>
            <li>
              <p>Discover what data derived from climate models is available
                through the tool.</p>
            </li>
            <li>
              <p>Select datasets based on the model that produced the data,
                the emissions scenario that drove the model, and the variable of
                interest.</p>
            </li>
            <li>
              <p>Visualize a selected dataset in a variety of ways,
                including:
              </p>
              <ul>
                <li>
                  <p>geospatially (on an interactive map)</p>
                </li>
                <li>
                  <p>as one or more graphs, typically presenting change over
                    time</p>
                </li>
                <li>
                  <p>as a statistical summary table</p>
                </li>
              </ul>
            </li>
            <li>
              <p>Download the data shown in a visualization as an Excel
                compatible table or a CSV file.</p>
            </li>
          </ul>
          <h3>Application elements</h3>
          <p>It helps to have a little terminology for the various parts of the
            Climate Explorer application.</p>
          <p>
            <img src={overviewImg} alt='Overview of app'/>
          </p>

          <h2>Data available in Climate Explorer</h2>
          <p>
            There are four types of data available in Climate Explorer:
          </p>

          <ListGroup>
            <ListGroupItem header='Model output'>
              <p>
                Daily temperature and precipitation data output
                by global or regional climate models based on a
                combination of historical data and possible future greenhouse
                gas projections. The data is averaged by month over thirty year
                periods; there are six such periods from 1960 to 2100.
                This data is available for all of Canada.
              </p>
              <h5>Variable names and meanings</h5>
              <ListGroup>
                <ListGroupItem header='pr'>
                  Precipitation at ground level
                </ListGroupItem>
                <ListGroupItem header='tasmax'>
                  Daily maximum near-surface air temperature
                </ListGroupItem>
                <ListGroupItem header='tasmin'>
                  Daily minimum near-surface air temperature
                </ListGroupItem>
              </ListGroup>
            </ListGroupItem>

            <ListGroupItem header='Climdex (climate extremes indices)'>
              <p>
              Measures of weather extremes calculated from model output.
              Climdex defines 27 <a href='https://www.climdex.org/indices.html'>climate extremes indices</a>,
              encompassing extreme precipitation, extremes of temperature,
              or lack thereof in different ways.
              This is a heterogeneous dataset; a given extreme may be calculated
              either as a monthly index averaged over thirty year periods
              from 1960 to 2100, or an annual index calculated individually
              for each year from 1950 to 2100.
              This data is available for all of Canada.
              </p>
              <h5>Variable names and meanings</h5>
              <ListGroup>
                <ListGroupItem header='altcddETCCDI'>
                  <p>
                    Maximum number of consecutive days per year with less than 1mm
                    of precipitation
                  </p>
                  <p>
                    This is a variant ('alt') version of the <a href='https://www.climdex.org/indices.html'>Climdex</a> variable <em>CDD</em>.
                  </p>
                </ListGroupItem>
                <ListGroupItem header='altcsdiETCCDI'>
                  <p>
                    Cold spell duration index spanning years
                  </p>
                  <p>
                    This is a variant ('alt') version of the <a href='https://www.climdex.org/indices.html'>Climdex</a> variable <em>CSDI</em>.
                  </p>
                </ListGroupItem>
                <ListGroupItem header='altcwdETCCDI'>
                  <p>
                    Maximum number of consecutive days per year with at least 1mm of
                    precipitation
                  </p>
                  <p>
                    This is a variant ('alt') version of the <a href='https://www.climdex.org/indices.html'>Climdex</a> variable <em>CDD</em>.
                  </p>
                </ListGroupItem>
                <ListGroupItem header='altwsdiETCCDI'>
                  <p>
                    Warm spell duration index spanning years
                  </p>
                  <p>
                    This is a variant ('alt') version of the <a href='https://www.climdex.org/indices.html'>Climdex</a> variable <em>CDD</em>.
                  </p>
                </ListGroupItem>
                <ListGroupItem header='cddETCCDI'>
                  <p>
                    Maximum number of consecutive days with less than 1mm of
                    precipitation
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>CDD</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='csdiETCCDI'>
                  <p>
                    Cold spell duration index
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>CSDI</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='cwdETCCDI'>
                  <p>
                    Maximum number of consecutive days with at least 1mm of
                    precipitation
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>CWD</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='dtrETCCDI'>
                  <p>
                    Mean diurnal temperature range
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>DTR</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='fdETCCDI'>
                  <p>
                    Number of frost days
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>FD</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='gslETCCDI'>
                  <p>
                    Growing season length
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>GSL</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='idETCCDI'>
                  <p>
                    Number of icing days
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>ID</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='prcptotETCCDI'>
                  <p>
                    Annual total precipitation in wet days
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>PRCPTOT</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='r10mmETCCDI'>
                  <p>
                    Annual count of days with at least 10mm of precipitation
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>R10MM</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='r1mmETCCDI'>
                  <p>
                    Annual count of days with at least 1mm of precipitation
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>R1MM</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='r20mmETCCDI'>
                  <p>
                    Annual count of days with at least 20mm of precipitation
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>R20MM</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='r95pETCCDI'>
                  <p>
                    Annual total precipitation when daily precipitation exceeds the
                    95th percentile of wet day precipitation
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>R95P</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='r99pETCCDI'>
                  <p>
                    Annual total precipitation when daily precipitation exceeds the
                    99th percentile of wet day precipitation
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>R99P</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='rx1dayETCCDI'>
                  <p>
                    Annual Maximum 1-day Precipitation
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>RX1DAY</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='rx1dayETCCDI'>
                  <p>
                    Monthly Maximum 1-day Precipitation
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>RX1DAY</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='rx5dayETCCDI'>
                  <p>
                    Annual Maximum Consecutive 5-day Precipitation
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>RX5DAY</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='rx5dayETCCDI'>
                  <p>
                    Monthly Maximum Consecutive 5-day Precipitation
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>RX5DAY</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='sdiiETCCDI'>
                  <p>
                    Simple precipitation intensity index
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>SDII</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='suETCCDI'>
                  <p>
                    Number of summer days
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>SU</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='tn10pETCCDI'>
                  <p>
                    Percentage of days when daily minimum temperature is below the
                    10th percentile
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>TN10P</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='tn90pETCCDI'>
                  <p>
                    Percentage of days when daily minimum temperature is above the
                    90th percentile
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>TN90P</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='tnnETCCDI'>
                  <p>
                    Annual minimum of daily minimum temperature
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>TNN</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='tnnETCCDI'>
                  <p>
                    Monthly minimum of daily minimum temperature
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>TNN</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='tnxETCCDI'>
                  <p>
                    Annual maximum of daily minimum temperature
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>TNX</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='tnxETCCDI'>
                  <p>
                    Monthly maximum of daily minimum temperature
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>TNX</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='trETCCDI'>
                  <p>
                    Number of tropical nights
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>TR</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='tx10pETCCDI'>
                  <p>
                    Percentage of days when daily maximum temperature is below the
                    10th percentile
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>TX10P</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='tx90pETCCDI'>
                  <p>
                    Percentage of days when daily maximum temperature is above the
                    90th percentile
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>TX90P</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='txnETCCDI'>
                  <p>
                    Annual minimum of daily maximum temperature
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>TXN</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='txnETCCDI'>
                  <p>
                    Monthly minimum of daily maximum temperature
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>TXN</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='txxETCCDI'>
                  <p>
                    Annual maximum of daily maximum temperature
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>TXX</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='txxETCCDI'>
                  <p>
                    Monthly maximum of daily maximum temperature
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>TXX</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='wsdiETCCDI'>
                  <p>
                    Warm spell duration index
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>WSDI</em>.</p>
                </ListGroupItem>
              </ListGroup>
            </ListGroupItem>

            <ListGroupItem header='Degree-days'>
              <p>
              Counts of how many days fall below or above a given temperature
              threshold multiplied by how much the threshold is exceeded,
              calculated from model output, usually over a period of a year
              (although seasonal and monthly degree-day counts are also
              possible).
              The data is averaged over several thirty year periods between
              1970 to 2100.
              This data is available for all of British Columbia.
              </p>
              <h5>Variable names and meanings</h5>
              <ListGroup>
              </ListGroup>
            </ListGroupItem>

            <ListGroupItem header='Return periods'>
              <p>
              Calculated from model output using a generalized extreme value
              distribution, this dataset describes extreme temperature or
              precipitation events that would be expected to occur once every
              twenty years. T
              his data is available for six thirty year periods from
              1960 to 2100.
              This data is available for all of British Columbia.
              </p>
              <h5>Variable names and meanings</h5>
              <ListGroup>
              </ListGroup>
            </ListGroupItem>
          </ListGroup>

          <h2>Datasets and data filtering</h2>
          <p>Climate Explorer has a huge base of data available—far too much
            to present usefully in any single view. A selection (filtering)
            process must come between data and presentation.</p>
          <h3>Datasets</h3>
          <p>A <i>dataset</i> is a collection of data for a specific model,
            emissions scenario, variable, model run, and time period. It
            comprises values of the variable for specific points in space and
            time, usually over a regular spatial grid and sequence of time
            points.
          </p>
          <p>Specifically, a dataset is a collection of geospatial
            (longitude-latitude) grids. Each grid holds the data for a particular
            time. (Conversely, you could think of a dataset as a geospatial grid
            of time series, but the data is in fact stored as a grid per time
            value.)</p>
          <h3>Dataset filtering</h3>
          <p>The first step of any effort to examine all the available data is
            to select a smaller, more digestible subset of it to be examined.
            This selection goes by the name of <i>dataset filtering</i> or
            just <i>filtering</i>.
          </p>
          <p>The criteria by which datasets are filtered  are:</p>
          <ListGroup>
            <ListGroupItem header='Model'>
              Which GCM produced the base data for the dataset.
                (Almost all data available in Climate Explorer is further
                processed
                from this base data. Specifically, most of the data available
                has
                been downscaled from the relatively coarse global grid of the
                GCM to
                a finer grid suited to regional analysis. Other post-processing
                includes forming long-term averages and forming derived
                variables
                such as climate indices.)
            </ListGroupItem>
            <ListGroupItem header='Emissions Scenario'>
              Which scenario of climate-changing emissions (greenhouse gases,
              etc.) was used as an input to the model runs.
            </ListGroupItem>
            <ListGroupItem header='Variable(s)'>
              Which output variable(s) from the model runs
                you are interested in. (For example: maximum temperature,
                precipitation, number of frost-free days.)
            </ListGroupItem>
          </ListGroup>
          <p>The result of data filtering is a collection of one or
            more <i>datasets</i>.
          </p>
          <h4>Distinguishing datasets within a filtered
            collection</h4>
          <p>Filtering (by model, emissions scenario, variable) in general
            results in more than one dataset.
          </p>
          <p>Individual datasets within a filtered collection are characterized
            by:</p>
          <ListGroup>
            <ListGroupItem header='Model Run'>
              <p>
                The following explanation is taken
                from <a href='https://portal.enes.org/data/enes-model-data/cmip5/datastructure'>ENES</a>:
              </p>
              <blockquote>
                Many CMIP5 experiments, the so-called ensemble calculations,
                were calculated using several initial states, initialisation
                methods or physics details. Ensemble calculations facilitate
                quantifying the variability of simulation data concerning a
                single model. For example, climate model simulations are
                dependent on the initial state. The variability we know from
                weather is also existent in climate simulations. The ensemble
                members with different initial states are usually called
                realizations. Initialisation method and physics details may also
                have an influence. Physics details may be parameterisation
                constants, for example. In the CMIP5 project, ensemble members
                are named in the rip-nomenclature, r for realization, i for
                initialisation and p for physics, followed by an integer, e.g.
                r1i1p1.
              </blockquote>
              <p>
                You will find all datasets in CE labelled by a rip code as above.
              </p>
            </ListGroupItem>
            <ListGroupItem header='Time Period'>
              The time period the dataset spans.
            </ListGroupItem>
          </ListGroup>

          <h2>Data presentations</h2>
          <p>Climate Explorer presents data in several different ways. The
            following is a summary of the different presentations available.</p>
          <ListGroup>
            <ListGroupItem header='Data Map'>
              <p>The Data Map is an interactive web map that presents one or two
                datasets selected from the filtered collection. It shows a
                spatial
                slice of the data for a specific point in time.</p>
              <p>A single variable (or the primary variable in a comparison
                view)
                is represented as a raster (a grid of coloured blocks)
                overlaid on the base map.
                Colours encode the variable’s value.</p>
              <p>The secondary variable (in a comparison view) is represented as
                a set of isolines (contours of constant value) overlaid on the
                base map. Isolines are colour-coded by value.</p>
              <p>The data map is the most complex data presentation tool, and
                has a
                substantial collection of generic web mapping features and data
                presentation features. See below for details of these
                features.</p>
            </ListGroupItem>
            <ListGroupItem header='Data Graphs'>
              <p>A data graph typically presents a non-spatial view of one or
                more
                datasets. Typically this view is temporal, that is, it is a
                graph
                with time as the horizontal axis.</p>
              <p>Depending on the specific graph, more than one dataset may be
                represented. This is useful for comparing datasets and/or giving
                context to the dataset(s) displayed in the data map.</p>
              <p>IMPORTANT: Spatial averaging: Data shown in all graphs is
                averaged
                over either the entire spatial extent of the dataset or over the
                spatial extent you select by drawing a polygon on the map.</p>
            </ListGroupItem>
            <ListGroupItem header='Statistical Summary'>
              <p>The Statistical Summary table presents a statistical summary of
                a
                single dataset. The summary includes the usual statistics such
                as
                mean, minimum, maximum, standard deviation, etc.</p>
              <p>IMPORTANT: Spatial averaging: Data summarized in this table is
                averaged over either the entire spatial extent of the dataset or
                over
                the spatial extent you select by drawing a polygon on the
                map.</p>
            </ListGroupItem>
          </ListGroup>

          <h2>Data Map features</h2>
          <h3>Map tools</h3>
          <p>On the left-hand side of the map you will find a standard
            selection of web map tools.</p>
          <p><b>Note </b><b>on terminology</b>: “Layer”: Technically a
            polygon is a “map layer.” You only need to know this because it
            is the terminology used in the the tooltips for the various
            polygon-drawing tools. Read “layer” as “polygon.”</p>
          <h4>Zoom In / Zoom Out</h4>
          <h4>Draw Polygon</h4>
          <p>Draw a general polygon on the map.
          </p>
          <ol>
            <li>
              <p>Click to place a corner of the polygon.
              </p>
            </li>
            <li>
              <p>Click on the first point placed to complete the polygon.
              </p>
            </li>
          </ol>
          <h4>Draw Rectangle</h4>
          <p>Draw a rectangular on the map. (It is a rectangle in pixel
            coordinates, not in projection coordinates.)</p>
          <ol>
            <li value="1">
              <p>Click on one corner, drag to the opposite corner
                and release.</p>
            </li>
          </ol>
          <p><b>Circle Marker</b>: <i>Not used in this application. To be
            removed at a future date.</i></p>
          <h4>Edit Polygon</h4>
          <p>Edit an existing polygon on the map.
          </p>
          <p>This appears not to work (Save does not function; only Cancel).
            Workaround: Delete your erroneous polygon and draw it again.</p>
          <h4>Delete Polygons (Layers)</h4>
          <p>To delete a single polygon:
          </p>
          <ol>
            <li value="1">
              <p>Click the Delete Polygons button.
              </p>
            </li>
            <li>
              <p>The mouse cursor becomes a pointer. Save and Cancel buttons
                appear beside the Delete Polygons button.</p>
            </li>
            <li>
              <p>Click on the polygon to delete.</p>
            </li>
            <li>
              <p>The selected polygon disappears.</p>
            </li>
            <li>
              <p>Click the Save button beside the Delete Polygons button.</p>
            </li>
          </ol>
          <p>To delete all polygons, click the Clear All button.</p>
          <p>To cancel (individual) deletions and close the tool, click Cancel.</p>
          <h4>Import Polygon</h4>
          <p>Imports a polygon defined in an external file. Accepts a zipped
            Shapefile or a GeoJSON file containing a single Feature (not a
            FeatureCollection).</p>
          <p>To import a polygon:
          </p>
          <ol>
            <li value="1">
              <p>Click the Import Polygon button.</p>
            </li>
            <li>
              <p>Click Choose File.
              </p>
            </li>
            <li>
              <p>Navigate to and select the file containing the polygon
                definition.
              </p>
            </li>
            <li>
              <p>Click OK.
              </p>
            </li>
            <li>
              <p>The imported polygon is added to your map.</p>
            </li>
          </ol>
          <h4>Export Polygon</h4>
          <p>Exports a polygon in one of the following formats: Shapfile,
            GeoJSON, WKT, KML, GPX.</p>
          <p>To export a polygon:
          </p>
          <ol>
            <li value="1">
              <p>Click the Export Polygon button.</p>
            </li>
            <li>
              <p>Click a button for the desired export file format.
              </p>
            </li>
            <li>
              <p>Navigate to the desired location to save the file and enter
                a name for the file.</p>
            </li>
            <li>
              <p>Click Save.
              </p>
            </li>
            <li>
              <p>The polygon on your map is saved to the file in the
                selected format.</p>
            </li>
          </ol>
          <h3>Colour scales and autoscaling</h3>
          <p>On the right-hand side of the map, you will find one or two colour
            scale references and the autoscale (AS) button.</p>
          <h4>Colour scales</h4>
          <p>A <i>colour scale</i> is a mapping between values that points in
            the dataset can take on and the colour displayed on the map to
            represent that data point.</p>
          <p>Mappings from data value to colour essentially treat colour as
            one-dimensional real variable ranging from 0 (first colour) to 1
            (last colour). For the purposes of discussion, we call this colour
            variable the “colour index.”</p>
          <p>In general, a colour scale maps data values lying between chosen
            minimum and maximum values, V<sub>min</sub> and V<sub>max</sub>,
            respectively. Those values are usually determined by the value range
            of the dataset. Sometimes they are actually the dataset minimum and
            maximum values; sometimes they are derived from other, comparison
            datasets. To convey the maximum amount of information to the human
            user, the minimum and maximum values should be close to the dataset’s
            minimum and maximum values.</p>
          <p>We offer two different types of color scale, linear and
            logarithmic. These are distinguished by how data values are mapped
            onto the colour index:</p>
          <ul>
            <li>
              <p>Linear: Maps the value of the data point linearly to colour
                index, with V<sub>min</sub> mapping to colour index 0, and
                V<sub>max</sub>
                mapping to colour index 1.</p>
            </li>
            <li>
              <p>Logarithmic: Maps the logarithm of the data point linearly
                to colour index, with log(V<sub>min</sub>) mapping to colour
                index
                0, and log(V<sub>max</sub>) mapping to colour index 1.</p>
            </li>
          </ul>
          <h4>Colour scale references</h4>
          <p>A <i>colour scale </i><i>reference</i> is a map tool that shows
            the relationship between a colour displayed on the map and the value
            of the data (variable) represented by that colour. Three
            representative data values are shown to the left of the colour band:
          </p>
          <ul>
            <li>
              <p>Top: V<sub>max</sub></p>
            </li>
            <li>
              <p>Middle: Mean value.</p>
              <ul>
                <li>
                  <p>If linear colour scale, arithmetic mean = (V<sub>min</sub>
                    + V<sub>max</sub>)/2.</p>
                </li>
                <li>
                  <p>If logarithmic colour scale, geometric mean =
                    sqrt(V<sub>min</sub>
                    * V<sub>max</sub>).</p>
                </li>
              </ul>
              <li>
                <p>Bottom: V<sub>min</sub></p>
              </li>
            </li>
          </ul>
          <p>
            When only one variable is displayed on the map (as a raster),
            there is one colour scale reference.</p>
          <p>When two variables are displayed on the map (raster and
            isolines), there are two colour scale references. The upper reference
            is for isolines and the lower reference is for raster.</p>
        </HalfWidthCol>
      </Row>
    </Grid>
  );
}

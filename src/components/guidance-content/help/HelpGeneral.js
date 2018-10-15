import React from 'react';
import { Link } from 'react-router-dom';
import {
  Grid, Row, ListGroup, ListGroupItem, Table,
} from 'react-bootstrap';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import overviewImg from '../../../assets/overview.png';
import { gcmDefn } from '../info/InformationItems';
import Accordion from '../../guidance-tools/Accordion';

const cddCaution = (<span>
  Please note the distinction between the variable we label <code>cdd</code>,
  meaning cooling degree-days,
  and the Climdex variable <code>CDD</code>,
  meaning maximum length of dry spell,
  which we label <code>cddETCCDI</code>.
</span>);

const monthlyAnnualVarNameAmbiguityCaution = (<span>
  Unlike most Climdex variable names used in Climate Explorer,
  this variable name can refer to either an annual version
  (calculation spanning a calendar year) or to the standard
  Climdex monthly version. The distinction is shown in the
  English description part of labels in selectors, so that the
  meaning in each specific context is unambiguous.
</span>);

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
            section.
            This is a work in progress. {' '}
            <Link to='/about/contact'>Feedback and suggestions</Link> are
            always welcome!
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
            There are four types of data available in Climate Explorer.
            (Click on a heading to expand the full explanation of each type.)
          </p>

          <Accordion>
            <Accordion.Item
              title='Model output'
              eventKey={1}
            >
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
                  Precipitation at ground level.
                </ListGroupItem>
                <ListGroupItem header='tasmax'>
                  Daily maximum near-surface air temperature.
                </ListGroupItem>
                <ListGroupItem header='tasmin'>
                  Daily minimum near-surface air temperature.
                </ListGroupItem>
              </ListGroup>
            </Accordion.Item>

            <Accordion.Item
              title='Climdex (climate extremes indices)'
              eventKey={2}
            >
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
                    Dry spell duration index spanning years:
                    Maximum number of consecutive days in one year with less
                    than 1 mm of precipitation.
                  </p>
                  <p>
                    This is an alternative version of the <a href='https://www.climdex.org/indices.html'>Climdex</a> variable <em>CDD</em>.
                    It represents the full length of continuous dry spells
                    that extend across the (artifical) December-January boundary
                    of a calendar year.
                  </p>
                  <p>{cddCaution}</p>
                </ListGroupItem>
                <ListGroupItem header='altcsdiETCCDI'>
                  <p>
                    Cold spell duration index spanning years:
                    Count of days with at least 6 consecutive days when
                    daiy minimum temperature &lt; 10th percentile.
                  </p>
                  <p>
                    This is an alternative version of the <a href='https://www.climdex.org/indices.html'>Climdex</a> variable <em>CSDI</em>.
                    It represents the full length of continuous cold spells
                    that extend across the (artifical) December-January boundary 
                    of a calendar year.
                  </p>
                </ListGroupItem>
                <ListGroupItem header='altcwdETCCDI'>
                  <p>
                    Maximum length of wet spell spanning years:
                    Maximum number of consecutive days with at
                    least 1 mm of precipitation.
                  </p>
                  <p>
                    This is an alternative version of the <a href='https://www.climdex.org/indices.html'>Climdex</a> variable <em>CWD</em>.
                    It represents the full length of continuous wet spells
                    that extend across the (artifical) December-January boundary
                    of a calendar year.
                  </p>
                </ListGroupItem>
                <ListGroupItem header='altwsdiETCCDI'>
                  <p>
                    Warm spell duration index spanning years:
                    Count of days with at least 6 consecutive days when
                    daily maximum temperature &gt; 90th percentile.
                  </p>
                  <p>
                    This is an alternative version of the <a href='https://www.climdex.org/indices.html'>Climdex</a> variable <em>WSDI</em>.
                    It represents the full length of continuous warm spells
                    that extend across the (artifical) December-January boundary
                    of a calendar year.
                  </p>
                </ListGroupItem>
                <ListGroupItem header='cddETCCDI'>
                  <p>
                    Maximum length of dry spell:
                    Maximum number of consecutive days with less than 1 mm of
                    precipitation.
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>CDD</em>.</p>
                  <p>{cddCaution}</p>
                </ListGroupItem>
                <ListGroupItem header='csdiETCCDI'>
                  <p>
                    Cold spell duration index:
                    Annual count of days with at least 6 consecutive days when
                    daiy minimum temperature &lt; 10th percentile.
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>CSDI</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='cwdETCCDI'>
                  <p>
                    Maximum length of wet spell:
                    Maximum number of consecutive days with at least 1 mm of
                    precipitation.
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>CWD</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='dtrETCCDI'>
                  <p>
                    Mean diurnal temperature range:
                    Monthly mean difference between daily maximum temperature
                    and daily minimum temperature.
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>DTR</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='fdETCCDI'>
                  <p>
                    Number of frost days:
                    Annual count of days when daily minimum temperature.
                    &lt; 0&deg;C.
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>FD</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='gslETCCDI'>
                  <p>
                    Growing season length.
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>GSL</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='idETCCDI'>
                  <p>
                    Number of icing days:
                    Annual count of days when daily maximum temperature.
                    &lt; 0&deg;C.
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>ID</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='prcptotETCCDI'>
                  <p>
                    Annual total precipitation in wet days.
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>PRCPTOT</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='r10mmETCCDI'>
                  <p>
                    Annual count of days with at least 10 mm of precipitation.
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>R10MM</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='r1mmETCCDI'>
                  <p>
                    Annual count of days with at least 1 mm of precipitation.
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>R1MM</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='r20mmETCCDI'>
                  <p>
                    Annual count of days with at least 20 mm of precipitation.
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>R20MM</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='r95pETCCDI'>
                  <p>
                    Annual total precipitation when daily precipitation exceeds the
                    95th percentile of wet day precipitation
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>R95pTOT</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='r99pETCCDI'>
                  <p>
                    Annual total precipitation when daily precipitation exceeds the
                    99th percentile of wet day precipitation
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>R99pTOT</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='rx1dayETCCDI'>
                  <p>
                    Annual Maximum 1-day Precipitation
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>RX1DAY</em>.</p>
                  <p>{monthlyAnnualVarNameAmbiguityCaution}</p>
                </ListGroupItem>
                <ListGroupItem header='rx1dayETCCDI'>
                  <p>
                    Monthly Maximum 1-day Precipitation
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>RX1DAY</em>.</p>
                  <p>{monthlyAnnualVarNameAmbiguityCaution}</p>
                </ListGroupItem>
                <ListGroupItem header='rx5dayETCCDI'>
                  <p>
                    Annual Maximum Consecutive 5-day Precipitation
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>RX5DAY</em>.</p>
                  <p>{monthlyAnnualVarNameAmbiguityCaution}</p>
                </ListGroupItem>
                <ListGroupItem header='rx5dayETCCDI'>
                  <p>
                    Monthly Maximum Consecutive 5-day Precipitation
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>RX5DAY</em>.</p>
                  <p>{monthlyAnnualVarNameAmbiguityCaution}</p>
                </ListGroupItem>
                <ListGroupItem header='sdiiETCCDI'>
                  <p>
                    Simple precipitation intensity index.
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>SDII</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='suETCCDI'>
                  <p>
                    Number of summer days:
                    Annual count of days when daily maximum temperature &gt; 25&deg;C.
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>SU</em>.</p>
                </ListGroupItem>
                <ListGroupItem header='tn10pETCCDI'>
                  <p>
                    Percentage of days when daily minimum temperature is below the
                    10th percentile.
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
                    Number of tropical nights:
                    Annual count of days when daily minimum temperature) exceeds 20&deg;C.
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
                  <p>{monthlyAnnualVarNameAmbiguityCaution}</p>
                </ListGroupItem>
                <ListGroupItem header='txnETCCDI'>
                  <p>
                    Monthly minimum of daily maximum temperature
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>TXN</em>.</p>
                  <p>{monthlyAnnualVarNameAmbiguityCaution}</p>
                </ListGroupItem>
                <ListGroupItem header='txxETCCDI'>
                  <p>
                    Annual maximum of daily maximum temperature
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>TXX</em>.</p>
                  <p>{monthlyAnnualVarNameAmbiguityCaution}</p>
                </ListGroupItem>
                <ListGroupItem header='txxETCCDI'>
                  <p>
                    Monthly maximum of daily maximum temperature
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>TXX</em>.</p>
                  <p>{monthlyAnnualVarNameAmbiguityCaution}</p>
                </ListGroupItem>
                <ListGroupItem header='wsdiETCCDI'>
                  <p>
                    Warm spell duration index:
                    Count of days with at least 6 consecutive days when
                    daily maximum temperature &gt; 90th percentile.
                  </p>
                  <p>For details, see <a href='https://www.climdex.org/indices.html'>Climdex</a>, <em>WSDI</em>.</p>
                  <p>{monthlyAnnualVarNameAmbiguityCaution}</p>
                </ListGroupItem>
              </ListGroup>
            </Accordion.Item>

            <Accordion.Item
              title='Degree-days'
              eventKey={3}
            >
              <p>
                Counts of how many days fall below or above a given temperature
                threshold multiplied by how much the threshold is exceeded,
                calculated from model output, over a period of one year.
                The data is averaged over four thirty year periods between
                1970 to 2100, namely
                1971-2000,
                2011-2040,
                2041-2070, and
                2071-2100.
                This data is available for all of British Columbia.
              </p>
              <p>
                A degree-day is a measure of the how much
                the actual temperature (usually the mean average temperature)
                falls either above or below a threshold temperature that
                represents a temperature of
                interest (e.g., freezing, temperature at which cooling is
                required).
                For a given degree-day measure,
                the difference is only counted when the actual
                temperature is either above or below the threshold,
                the condition (above, below) being given as part of the
                measure's definition.
                One degree day is one day with a temperature
                difference from threshold of 1 degree (in Canada, &deg;C).
                A day with a temperature difference of 3 degrees represents
                3 degree-days. The total degree-days over a given period
                (e.g., a month, a year) is the total degree-days for each day
                in that period, always respecting both the threshold and the
                condition (above, below) in counting each day.
              </p>
              <h5>Variable names and meanings</h5>
              <ListGroupItem header='cdd'>
                <p>
                  Cooling Degree Days:
                  Degree-days in one year above 18&deg;C.
                </p>
                <p>{cddCaution}</p>
              </ListGroupItem>
              <ListGroupItem header='hdd'>
                Heating Degree Days:
                Degree-days in one year below 18&deg;C.
              </ListGroupItem>
              <ListGroupItem header='gdd'>
                Growing Degree Days:
                Degree-days in one year above 5&deg;C.
              </ListGroupItem>
              <ListGroupItem header='fdd'>
                Frost Degree Days:
                Degree-days in one year below 0&deg;C.
              </ListGroupItem>
            </Accordion.Item>

            <Accordion.Item
              title='Return periods'
              eventKey={4}
            >
              <p>
                This dataset describes extreme temperature or
                precipitation events that would be expected to occur once
                during a specified "return period," for example once every
                20 years.
                These datasets are calculated from model output using a
                generalized extreme value distribution.
                This data is available for four thirty year climatological
                periods from 1970 to 2100, namely
                1971-2000,
                2011-2040,
                2041-2070, and
                2071-2100.
                This data is available for all of British Columbia.
              </p>
              <h5>Variable names and meanings</h5>
              <ListGroup>
                <ListGroupItem header='rp5pr'>
                  5-year annual maximum one day precipitation amount
                </ListGroupItem>
                <ListGroupItem header='rp20pr'>
                  20-year annual maximum one day precipitation amount
                </ListGroupItem>
                <ListGroupItem header='rp50pr'>
                  50-year annual maximum one day precipitation amount
                </ListGroupItem>
                <ListGroupItem header='rp5tasmax'>
                  5-year annual maximum daily maximum temperature
                </ListGroupItem>
                <ListGroupItem header='rp20tasmax'>
                  20-year annual maximum daily maximum temperature
                </ListGroupItem>
                <ListGroupItem header='rp50tasmax'>
                  50-year annual maximum daily maximum temperature
                </ListGroupItem>
                <ListGroupItem header='rp5tasmin'>
                  5-year annual minimum daily minimum temperature
                </ListGroupItem>
                <ListGroupItem header='rp20tasmin'>
                  20-year annual minimum daily minimum temperature
                </ListGroupItem>
                <ListGroupItem header='rp50tasmin'>
                  50-year annual minimum daily minimum temperature
                </ListGroupItem>
              </ListGroup>
            </Accordion.Item>
          </Accordion>

          <h2>Models (GCMs)</h2>
          <p>{gcmDefn}</p>
          <p>
            In Climate Explorer, models are indentified by short codes.
            The following table gives the full name and provenance of these
            models.
          </p>
          <ListGroup>
            <ListGroupItem header='GFDL-CM3'>
              <a
                href='https://www.gfdl.noaa.gov/coupled-physical-model-cm3/'
                target='_blank'
              >
                U.S. Geophysical Fluid Dynamics Laboratory
                Coupled Physical Model CM3
              </a>
            </ListGroupItem>
            <ListGroupItem header='GFDL-ESM2G'>
              <a
                href='https://www.gfdl.noaa.gov/earth-system-model/'
                target='_blank'
              >
                U.S. Geophysical Fluid Dynamics Laboratory
                ESM2G model
              </a>
            </ListGroupItem>
            <ListGroupItem header='GFDL-ESM2M'>
              <a
                href='https://www.gfdl.noaa.gov/earth-system-model/'
                target='_blank'
              >
                U.S. Geophysical Fluid Dynamics Laboratory
                ESM2M model
              </a>
            </ListGroupItem>
            <ListGroupItem header='HadGEM2-AO'>
              <a
                href='https://www.geosci-model-dev.net/4/723/2011/gmd-4-723-2011.pdf'
                target='_blank'
              >
                U.K. Met Office
                HadGEM2 AO
                (Troposphere, Land Surface &amp; Hydrology,
                Aerosols, Ocean &amp; Sea-ice) model
              </a>
            </ListGroupItem>
            <ListGroupItem header='HadGEM2-ES'>
              <a
                href='https://www.geosci-model-dev.net/4/723/2011/gmd-4-723-2011.pdf'
                target='_blank'
              >
                U.K. Met Office
                HadGEM2 ES
                (Troposphere, Land Surface & Hydrology,
                Aerosols, Ocean & Sea-ice, Terrestrial
                Carbon Cycle, Ocean Biogeochemistry,
                Chemistry)
                model
              </a>
            </ListGroupItem>
            <ListGroupItem header='HadGEM2-CC'>
              <a
                href='https://www.geosci-model-dev.net/4/723/2011/gmd-4-723-2011.pdf'
                target='_blank'
              >
                U.K. Met Office
                HadGEM2 CC
                (Troposphere, Land Surface &amp; Hydrology,
                Aerosols, Ocean &amp; Sea-ice, Terrestrial
                Carbon Cycle, Ocean Biogeochemistry)
              </a>
            </ListGroupItem>
            <ListGroupItem header='MRI-CGCM3'>
              <a
                href='https://www.jstage.jst.go.jp/article/jmsj/90A/0/90A_2012-A02/_pdf'
                target='_blank'
              >
                Japan Meteorological Research Institute
                CCGM3 model
              </a>
            </ListGroupItem>
            <ListGroupItem header='CNRM-CM5'>
              <a
                href='http://www.umr-cnrm.fr/spip.php?article126&lang=en'
                target='_blank'
              >
                France Centre National de Recherches Météorologiques
                (National Centre for Meteorological Research)
                CNRM-CM5 model
              </a>
            </ListGroupItem>
            <ListGroupItem header='CCSM4'>
              <a
                href='http://www.cesm.ucar.edu/models/ccsm4.0/'
                target='_blank'
              >
                U.S. National Center for Atmospheric Research
                CCSM4 4.0 model
              </a>
            </ListGroupItem>
            <ListGroupItem header='CSIRO-Mk3-6-0'>
              <a
                href='https://confluence.csiro.au/public/CSIROMk360'
                target='_blank'
              >
                Australia Commonwealth Scientific and Industrial Research Organisation
                CSIRO-Mk3.6.0 model
              </a>
            </ListGroupItem>
            <ListGroupItem header='inmcm4'>
              <a
                href='http://www.glisaclimate.org/node/2220'
                target='_blank'
              >
                Russia Institute for Numerical Mathematics
                Climate Model Version 4
              </a>
              We are unable to find a more authoritative reference in English
              for this model.
            </ListGroupItem>
            <ListGroupItem header='bcc-csm1-1-m'>
              <a
                href='http://forecast.bcccsm.ncc-cma.net/web/channel-63.htm'
                target='_blank'
              >
                China Beijing Climate Center
                Climate System Model version 1.1 (m)
              </a>
            </ListGroupItem>
            <ListGroupItem header='FGOALS-g2'>
              <a
                href='http://www.lasg.ac.cn/fgoals/index2.asp'
                target='_blank'
              >
                China LASG
                (Laboratory of Numerical Modeling for Atmospheric Sciences
                and Geophysical Fluid Dynamics)
                FGOALS-g2 model
              </a>
            </ListGroupItem>
            <ListGroupItem header='CanESM2'>
              <a
                href='https://www.ec.gc.ca/ccmac-cccma/default.asp?lang=En&n=1A3B7DF1-1&wbdisable=true'
                target='_blank'
              >
                Canadian Centre for Climate Modelling and Analysis
                ESM2 (Earth System Model ver. 2)
              </a>
            </ListGroupItem>
            <ListGroupItem header='MIROC5'>
              <a
                href='https://journals.ametsoc.org/doi/10.1175/2010JCLI3679.1'
                target='_blank'
              >
                Japan Agency for Marine-Earth Science and Technology;
                Atmosphere and Ocean Research Institute;
                Centre for Climate System Research -
                National Institute for Environmental Studies
                MIROC5
                (Model for Interdisciplinary Research on Climate, ver. 5)
              </a>
            </ListGroupItem>
            <ListGroupItem header='MIROC-ESM-CHEM'>
              <a
                href='https://www.researchgate.net/publication/253418457_MIROC-ESM_model_description_and_basic_results_of_CMIP5-20c3m_experiments'
                target='_blank'
              >
                Japan Agency for Marine-Earth Science and Technology;
                Atmosphere and Ocean Research Institute;
                Centre for Climate System Research -
                National Institute for Environmental Studies
                MIROC-ESM-CHEM
                (Model for Interdisciplinary Research on Climate
                Earth System Model with Atmospheric Chemistry)
              </a>
            </ListGroupItem>
            <ListGroupItem header='MPI-ESM-LR'>
              <a
                href='https://www.mpimet.mpg.de/en/science/models/mpi-esm/'
                target='_blank'
              >
                Germany Max Planck Institute
                ESM (Earth System Model)
              </a>
            </ListGroupItem>
            <ListGroupItem header='ACCESS1-0'>
              <a
                href='http://climate-cms.unsw.wikispaces.net/file/view/Bi_AMOJ_ACCESS-CM_revision.pdf'
                target='_blank'
              >
                Australian Community Climate and Earth System Simulator
                coupled model
              </a>
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
            (longitude-latitude) grids. Each geospatial grid holds the data for
            a particular
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
          <p>We offer two different types of colour scale, linear and
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
          <p>When two colour-mapped variables are displayed on the map (raster and
            isolines), there are two colour scale references. The upper reference
            is for isolines and the lower reference is for raster.</p>

          <h2>Exported data file formats</h2>
          <h3>File formats: XSLX and CSV</h3>
          <p>
            Both file formats convey information as table with rows and
            columns, as typically managed by spreadsheet programs.
          </p>
          <h4>XSLX</h4>
          <p>
            This format is compatible with Microsoft Excel.
          </p>
          <h4>CSV</h4>
          <p>
            This format is plain text in the comma-separated variables format,
            with column separator being the comma (<code>,</code>).
          </p>
          <h3>Content formats</h3>
          <p>
            Each graph or data table is exported in a table layout suitable
            to its content. The following sections detail each such layout.
          </p>
          <h4>Annual Cycle graph</h4>
          <Table bordered condensed responsive>
            <thead>
              <tr>
                <th>Row number(s)</th>
                <th>Contents</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1&ndash;2</td>
                <td>Information identifying the dataset(s) presented in this
                graph.</td>
              </tr>
              <tr>
                <td>1</td>
                <td>Names of dataset selection criteria
                  (e.g., Model, Emissions Scenario). These define the dataset
                filter criteria and data subselections within the graph.</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Values of dataset selection criteria.</td>
              </tr>
              <tr>
                <td>3</td>
                <td>blank</td>
              </tr>
              <tr>
                <td>4&ndash;</td>
                <td>Values of data points presented in this graph.</td>
              </tr>
              <tr>
                <td>4</td>
                <td>
                  Headings for data columns.
                </td>
              </tr>
              <tr>
                <td>5&ndash;</td>
                <td>
                  <p>Data point values.</p>

                  <p>
                    Column <code>Time Series</code> identifies the curve on
                    the graph,
                    one of yearly, seasonal, or monthly mean values.</p>
                  <p>
                    The next 12 columns give the monthly values for each curve.
                    Note that there is a monthly value for each curve; for curves
                    with less than monthly resolution (seasonal, yearly),
                    values are repeated for the appropriate groups of months.
                  </p>
                  <p>
                    The <code>units</code> column gives the units of measure
                    for the data values.</p>
                </td>
              </tr>
            </tbody>
          </Table>

          <h4>Long Term Average graph</h4>
          <Table bordered condensed responsive>
            <thead>
            <tr>
              <th>Row number(s)</th>
              <th>Contents</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>1&ndash;2</td>
              <td>Information identifying the dataset(s) presented in this
                graph.</td>
            </tr>
            <tr>
              <td>1</td>
              <td>Names of dataset selection criteria
                (e.g., Model, Emissions Scenario). These define the dataset
                filter criteria and data subselections within the graph.</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Values of dataset selection criteria.</td>
            </tr>
            <tr>
              <td>3</td>
              <td>blank</td>
            </tr>
            <tr>
              <td>4&ndash;</td>
              <td>Values of data points presented in this graph.</td>
            </tr>
            <tr>
              <td>4</td>
              <td>
                Headings for data columns.
              </td>
            </tr>
            <tr>
              <td>5&ndash;</td>
              <td>
                <p>Data point values.</p>

                <p>
                  Column <code>Run</code> identifies the curve on the graph,
                  one the <em>r-i-p</em> run codes.</p>
                <p>
                  The next 6 columns give the values for each data point
                  on the curve, identified by the mid-point of the averaging
                  period (e.g., <code>2085-01-15</code>).
                </p>
                <p>
                  The <code>units</code> column gives the units of measure
                  for the data values.</p>
              </td>
            </tr>
            </tbody>
          </Table>

          <h4>Change from Baseline graph</h4>
          <p>See Annual Cycle graph</p>

          <h4>Statistical Summary table</h4>
          <Table bordered condensed responsive>
            <thead>
            <tr>
              <th>Row number(s)</th>
              <th>Contents</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>1&ndash;2</td>
              <td>Information identifying the dataset(s) presented in this
                table.</td>
            </tr>
            <tr>
              <td>1</td>
              <td>Names of dataset selection criteria
                (e.g., Model, Emissions Scenario). These define the dataset
                filter criteria and data subselections within the graph.</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Values of dataset selection criteria.</td>
            </tr>
            <tr>
              <td>3</td>
              <td>blank</td>
            </tr>
            <tr>
              <td>4&ndash;</td>
              <td>
                Values shown in table.
                Layout and content is the same as the table.
              </td>
            </tr>
            <tr>
              <td>4</td>
              <td>
                Headings for data columns.
              </td>
            </tr>
            <tr>
              <td>5&ndash;</td>
              <td>
                Data values.
              </td>
            </tr>
            </tbody>
          </Table>

        </HalfWidthCol>
      </Row>
    </Grid>
  );
}

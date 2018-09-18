import React from 'react';
import { Grid, Row, Col, ListGroup, ListGroupItem } from 'react-bootstrap';

export default function ClimateExplorer() {
  return (
    <Grid fluid>
      <Row>
        <Col lg={12}>
          <h1>Climate Explorer</h1>
        </Col>
      </Row>


      <Row>
        <Col lg={6}>

          <ListGroup>
            <ListGroupItem header='Description'>
              <p>
                A tool for visualizing and downloading
                climate model data and data derived from climate outputs
                for the B.C. - Yukon region.
              </p>
              <p>
                Climate Explorer is also fondly known as "the Marmot,"
                since it is an improvement (we sincerely hope) on its predecessor,
                the Regional Analysis Tool, or "RAT." Hence our mascot in the
                header.
              </p>
            </ListGroupItem>

            <ListGroupItem header='Version'>
              {CE_CURRENT_VERSION}
            </ListGroupItem>

            <ListGroupItem header='Author'>
              <a href='https://pacificclimate.org/'>
                Pacific Climate Impacts Consortium (PCIC)
              </a>
            </ListGroupItem>

            <ListGroupItem header='Terms of Use'>
              <p>
                In addition to PCIC's <a href='https://pacificclimate.org/terms-of-use'>terms of use</a>,
                the data for each individual data set is subject to the terms
                of use of each source organization. For further details please
                refer to:
              </p>
              <ul>
                <li>
                  <a href="../sites/default/files/tou-cmip5-pcmdi_llnl_gov_february-19th-2014.pdf" target="_blamk">
                    The Coupled Model Intercomparison Project
                  </a>
                </li>
                <li>
                  <a href="/sites/default/files/tou_earthsystemgrid_february-19th-2014.pdf">
                    National Center for Atmospheric Research Earth System Grid
                  </a>
                </li>
              </ul>
              <h4>No Warranty</h4>
              <p>The data in this tool are provided by the
                Pacific Climate Impacts Consortium
                with an open licence on an “AS IS” basis without any warranty
                or representation, express or implied, as to its accuracy or
                completeness. Any reliance you place upon the information
                contained here is your sole responsibility and strictly at
                your own risk.
                In no event will the Pacific Climate Impacts Consortium be
                liable for any loss or damage whatsoever, including without
                limitation, indirect or consequential loss or damage, arising
                from reliance upon the data or derived information.
              </p>
            </ListGroupItem>
          </ListGroup>
        </Col>
      </Row>
    </Grid>
  );
}

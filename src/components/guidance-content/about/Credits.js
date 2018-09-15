import React from 'react';
import { Grid, Row, Col, ListGroup, ListGroupItem } from 'react-bootstrap';

export default function Credits() {
  return (
    <Grid fluid>
      <h1>Credits and Acknowledgements</h1>
      <Row>
        <Col lg={6}>
          <h2>Sponsors</h2>
          <ListGroup>
            <ListGroupItem
              header='Ministry of Transportation and Infrastructure (MoTI)'
              href='https://www2.gov.bc.ca/gov/content/governments/organizational-structure/ministries-organizations/ministries/transportation-and-infrastructure'
            >
              Primary sponsor of the Climate Explorer project.
            </ListGroupItem>
          </ListGroup>

          <h2>Others</h2>
          <ListGroup>
            <ListGroupItem
              header='Vancouver Island Marmot Recovery Foundation'
              href='https://marmots.org/'
            >
              Use of MRF marmot graphic by kind permission.
            </ListGroupItem>
          </ListGroup>
        </Col>

        <Col lg={6}>
          <h2>Data</h2>
          <ListGroup>

            <ListGroupItem
              header='Environment Canada'
              href='http://www.ec.gc.ca/'
            >
              <p>
                We thank the Landscape Analysis and Applications section of the
                Canadian Forest Service, Natural Resources Canada for developing
                and making available the Canada-wide historical daily gridded
                climate dataset used as the downscaling target.
              </p>
              <p>
                PCIC gratefully acknowledges support from Environment Canada
                for the development of the statistically downscaled GCM
                scenarios on which much of the data presented here is based.
              </p>
            </ListGroupItem>

            <ListGroupItem
              header='World Climate Research Programme'
            >
              We acknowledge the World Climate Research Programme’s
              Working Group on Coupled Modelling, which is responsible for
              CMIP5, and we thank the climate modeling groups for producing
              and making available their GCM output.
            </ListGroupItem>

            <ListGroupItem
              header='U.S. Department of Energy'
              href=''
            >
              For CMIP the U.S. Department of Energy’s Program for
              Climate Model Diagnosis and Intercomparison provides coordinating
              support and led development of software infrastructure in
              partnership with the Global Organization for
              Earth System Science Portals.
            </ListGroupItem>

          </ListGroup>
        </Col>
      </Row>

    </Grid>
  );
}

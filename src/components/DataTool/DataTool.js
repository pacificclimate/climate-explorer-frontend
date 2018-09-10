import PropTypes from 'prop-types';
import React from 'react';
import { Grid, Row, Col, Nav, NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import SingleAppController from '../app-controllers/SingleAppController';

import _ from 'underscore';

import './DataTool.css';


export default class DataTool extends React.Component {
  static propTypes = {
  };

  render() {
    return (
      <Grid fluid>
        <Row>
            <Col lg={12}>
              <Nav
                bsStyle='tabs'
                justified
              >
                <LinkContainer to='/data/climo/ce_files'>
                  <NavItem eventKey={1}>Single dataset</NavItem>
                </LinkContainer>
                <LinkContainer to='/data/compare/ce_files'>
                  <NavItem eventKey={2}>Compare datasets</NavItem>
                </LinkContainer>
                <LinkContainer to='/data/precipitation/extreme_precipitation'>
                  <NavItem eventKey={4}>Extreme Precipitation</NavItem>
                </LinkContainer>
              </Nav>
            </Col>
        </Row>
        <Row>
          <Col>
            {this.props.children || <SingleAppController ensemble_name="ce_files"/>}
          </Col>
        </Row>
      </Grid>
    );
  }
}

import PropTypes from 'prop-types';
import React from 'react';
import { Row, Glyphicon } from 'react-bootstrap';
import { FullWidthCol } from '../../layout/rb-derived-components';
import classnames from 'classnames';

import css from './FlowArrow.css';


const FlowArrow = ({ position }) => (
  <Row className={classnames(css.flowArrow, css[position])}>
    <FullWidthCol className='text-center'>
      <Glyphicon glyph='arrow-down'/>
    </FullWidthCol>
  </Row>
);

FlowArrow.propTypes = {
  position: PropTypes.oneOf('top bottom'.split()).isRequired,
};

FlowArrow.defaultProps = {
  position: 'none',
};

export default FlowArrow;

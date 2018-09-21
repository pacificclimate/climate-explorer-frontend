import React from 'react';
import { Col } from 'react-bootstrap';

export const FullWidthCol = ({ children, ...rest }) =>
  <Col lg={12} md={12} sm={12} {...rest}>{children}</Col>;

export const HalfWidthCol = ({ children, ...rest }) =>
  <Col lg={6} md={6} sm={12} {...rest}>{children}</Col>;

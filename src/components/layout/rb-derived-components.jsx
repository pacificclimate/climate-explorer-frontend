import React from "react";
import { Col } from "react-bootstrap";

export const FullWidthCol = ({ children, ...rest }) => (
  <Col xl={12} lg={12} md={12} {...rest}>
    {children}
  </Col>
);

export const HalfWidthCol = ({ children, ...rest }) => (
  <Col xl={6} lg={6} md={12} {...rest}>
    {children}
  </Col>
);

export const ThirdWidthCol = ({ children, ...rest }) => (
  <Col xl={4} lg={12} md={12} {...rest}>
    {children}
  </Col>
);

export const QuarterWidthCol = ({ children, ...rest }) => (
  <Col xl={3} lg={12} md={12} {...rest}>
    {children}
  </Col>
);

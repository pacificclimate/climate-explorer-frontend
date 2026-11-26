import React from "react";
import { Accordion as BootstrapAccordion } from "react-bootstrap";

const AccordionItem = ({ eventKey, title, children }) => (
  <BootstrapAccordion.Item eventKey={String(eventKey)}>
    <BootstrapAccordion.Header>{title}</BootstrapAccordion.Header>
    <BootstrapAccordion.Body>{children}</BootstrapAccordion.Body>
  </BootstrapAccordion.Item>
);
const Accordion = ({ children }) => (
  <BootstrapAccordion>{children}</BootstrapAccordion>
);
Accordion.Item = AccordionItem;
export default Accordion;

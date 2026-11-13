import React from "react";
import { Panel, PanelGroup } from "react-bootstrap";

let idNum = 0;
const nextId = () => `accordion-${idNum++}`;

const AccordionItem = ({ eventKey, title, children }) => (
  <Panel eventKey={eventKey}>
    <Panel.Heading>
      <Panel.Title toggle>{title}</Panel.Title>
    </Panel.Heading>
    <Panel.Body collapsible>{children}</Panel.Body>
  </Panel>
);

const Accordion = ({ children }) => (
  <PanelGroup accordion id={nextId()}>
    {children}
  </PanelGroup>
);

Accordion.Item = AccordionItem;

export default Accordion;

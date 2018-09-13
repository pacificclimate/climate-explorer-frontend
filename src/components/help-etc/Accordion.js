import React from 'react';
import { Panel, PanelGroup } from 'react-bootstrap';

const AccordionItem = ({ eventKey, title, children }) => (
  <Panel eventKey={eventKey}>
    <Panel.Heading>
      <Panel.Title toggle>
        {title}
      </Panel.Title>
    </Panel.Heading>
    <Panel.Body collapsible>
      {children}
    </Panel.Body>
  </Panel>
);

const Accordion = ({ children }) => (
  <PanelGroup accordion>
    {children}
  </PanelGroup>
);

Accordion.Item = AccordionItem;

export default Accordion;

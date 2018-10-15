import React from 'react';
import { Grid, Row } from 'react-bootstrap';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import Accordion from '../../guidance-tools/Accordion';
import { appContact } from '../info/InformationItems';


const faqs = [
  {
    question: 'Which model should I select?',
    answer: <div>
      <p>
        Canada's own General Circulation Model, CanESM2, is the most representative
        model for Canada. It is a good default choice if you do not have
        specialized needs that would be better represented by a different model.
      </p>
    </div>,
  },

  {
    question: 'What emissions scenario should I select?',
    answer: <div>
      <p>
        The worst-case emissions scenario, RCP 8.5
        (presented in the selectors as <code>historical, rcp85</code>),
        is a good choice for making decisions that adapt to climate change.
      </p>
    </div>,
  },

  {
    question: 'How do I zoom in on the map?',
    answer: <div>
      <p>
        Click the
        <span
          className='leaflet-control-zoom leaflet-bar leaflet-control'
          style={{ float: 'none' }}
        >
          <a
            className='leaflet-control-zoom-in' href='#'>+</a>
        </span>
        button to zoom in.
      </p>
      <p>
        Click the
        <span
          className='leaflet-control-zoom leaflet-bar leaflet-control'
          style={{ float: 'none' }}
        >
          <a className='leaflet-control-zoom-out' href='#'>-</a>
        </span>
        button to zoom out.
      </p>
      <p>
        Alternatively, use the scroll wheel on your mouse, or, with a touch
        screen, pinch to zoom in and spread to zoom out.
      </p>
    </div>,
  },

  {
    question: `What are the small triangles in the column labels of tables 
      like the Statistical Summary for?`,
    answer: <div>
      <p>
        They are used to sort the table by that column.
        Click on a column header to sort by that column.
        Click again to change the direction of sorting.
      </p>
    </div>,
  },
  //
  // {
  //   question: 'question',
  //   answer: <div>
  //     <p>
  //
  //     </p>
  //   </div>,
  // },
];

const items = faqs.map((faq, i) => (
  <Accordion.Item
    key={i}
    eventKey={i}
    title={`${i + 1}: ${faq.question}`}
  >
    {faq.answer}
  </Accordion.Item>
));

const half = Math.ceil(items.length / 2);
const firstItems = items.slice(0, half);
const secondItems = items.slice(half);

export default function FAQ() {
  return (
    <Grid fluid>
      <Row>
        <FullWidthCol>
          <h1>Frequently Asked Questions</h1>
        </FullWidthCol>
      </Row>

      <Row>
        <HalfWidthCol>
          <p>
            The content of our FAQ is driven by our users' needs and questions.
          </p>
          <p>
            At present, we have few questions or answers here, because we don't
            yet know what you, our user, needs to know.
            Please <a href={appContact.email}>email us</a> with questions you
            would like to see in the FAQ.
          </p>
        </HalfWidthCol>
      </Row>

      <Row>
        <HalfWidthCol>
          <Accordion>
            {firstItems}
          </Accordion>
        </HalfWidthCol>

        <HalfWidthCol>
          <Accordion>
            {secondItems}
          </Accordion>
        </HalfWidthCol>
      </Row>
    </Grid>
  );
}

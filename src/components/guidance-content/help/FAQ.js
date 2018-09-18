import React from 'react';
import { Grid, Row } from 'react-bootstrap';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import Accordion from '../../guidance-tools/Accordion';
import { contactEmail } from '../info/InformationItems';


const faqs = [
  {
    question: 'What is the meaning of life?',
    answer: <div>
      <p>
        Sed ut perspiciatis unde omnis iste natus error sit voluptatem
        accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
        ab illo inventore veritatis et quasi architecto beatae vitae dicta
        sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
        aspernatur aut odit aut fugit, sed quia consequuntur magni dolores
        eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est,
        qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit,
        sed quia non numquam eius modi tempora incidunt ut labore et dolore
        magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis
        nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut
        aliquid ex ea commodi consequatur? Quis autem vel eum iure
        reprehenderit qui in ea voluptate velit esse quam nihil molestiae
        consequatur, vel illum qui dolorem eum fugiat quo voluptas
        nulla pariatur?
      </p>
      <p>
        &mdash; Cicero, <i>de Finibus Bonorum et Malorum</i>
      </p>
    </div>,
  },

  {
    question: 'How can I get rich quickly?',
    answer: `Buy low, sell high.`,
  },
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
            The content of our FAQ is driven by our users needs and questions.
          </p>
          <p>
            At present, we have no questions or answers here, because we don't
            yet know what you, our user, needs to know.
            Please <a href={contactEmail}>email us</a> with questions you
            would like to see in the FAQ.
          </p>
          <p>
            In the meantime, we offer the following pearls of wisdom.
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

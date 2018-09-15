import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Accordion from '../../guidance-tools/Accordion';


const faqs = [
  {
    question: 'What is the meaning of life?',
    answer: `
Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?    
`,
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
      <h1>Frequently Asked Questions</h1>
      <Row>
        <Col lg={6}>
          <Accordion>
            {firstItems}
          </Accordion>
        </Col>
        <Col lg={6}>
          <Accordion>
            {secondItems}
          </Accordion>
        </Col>
      </Row>
    </Grid>
  );
}

import React from 'react';
import { Grid, Row } from 'react-bootstrap';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import Accordion from '../../guidance-tools/Accordion';
import _ from 'underscore';
import T from '../../../utils/external-text';


export default class FAQ extends React.Component {
  static contextType = T.contextType;

  render() {
    const faqs = T.get(this.context, 'help.faq.items');
    console.log('FAQ: faqs =', faqs);

    if (!_.isArray(faqs)) {
      return null;
    }

    const items = faqs.map((faq, i) => (
      <Accordion.Item
        key={i}
        eventKey={i}
        title={`${i + 1}: ${faq.question}`}
      >
        <T.Markdown source={faq.answer}/>
      </Accordion.Item>
    ));

    const half = Math.ceil(items.length / 2);
    const firstItems = items.slice(0, half);
    const secondItems = items.slice(half);

    return (
      <Grid fluid>
        <Row>
          <FullWidthCol>
            <T path='help.faq.title' />
          </FullWidthCol>
        </Row>

        <Row>
          <HalfWidthCol>
            <T path='help.faq.intro' />
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
}

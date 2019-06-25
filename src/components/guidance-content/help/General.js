import React from 'react';
import { Grid, Row } from 'react-bootstrap';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import T from '../../../utils/external-text';
import List from '../../guidance-tools/List';

import '../styles.css';


export default class HelpGeneral extends React.Component {
  static contextType = T.contextType;

  render() {
    return (
      <Grid fluid className='markdown'>
        <Row>
          <FullWidthCol>
            <T item='help.general.title'/>
          </FullWidthCol>
        </Row>

        <Row>
          <HalfWidthCol>
            <T
              item='help.general.sections'
              evalContext={{ IMAGES: `${process.env.PUBLIC_URL}/images` }}
            />
          </HalfWidthCol>
        </Row>
      </Grid>
    );
  }
}

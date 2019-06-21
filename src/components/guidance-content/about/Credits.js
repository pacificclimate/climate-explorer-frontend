import React from 'react';
import { Grid, Row, ListGroup, ListGroupItem } from 'react-bootstrap';
import { FullWidthCol, HalfWidthCol } from '../../layout/rb-derived-components';
import T from '../../../utils/external-text';

export default class Credits extends React.Component {
  static contextType = T.contextType;

  render() {
    return (
      <Grid fluid>
        <Row>
          <FullWidthCol>
            <T item='about.credits.title' />
          </FullWidthCol>
        </Row>

        <Row>
          <HalfWidthCol>
            <T item='about.credits.sponsors.title'/>
            <ListGroup>
              <ListGroupItem
                header={T.getString(this.context, 'about.credits.sponsors.moti.header')}
                href={T.getString(this.context, 'about.credits.sponsors.moti.href')}
              >
                <T item='about.credits.sponsors.moti.body'/>
              </ListGroupItem>
            </ListGroup>

            <T item='about.credits.others.title'/>
            <ListGroup>
              <ListGroupItem
                header={T.getString(this.context, 'about.credits.others.vimrf.header')}
                href={T.getString(this.context, 'about.credits.others.vimrf.href')}
              >
                <T item='about.credits.others.vimrf.body'/>
              </ListGroupItem>
            </ListGroup>
          </HalfWidthCol>

          <HalfWidthCol>
            <T item='about.credits.data.title'/>
            <ListGroup>
              <ListGroupItem
                header={T.getString(this.context, 'about.credits.data.eccc.header')}
                href={T.getString(this.context, 'about.credits.data.eccc.href')}
              >
                <T item='about.credits.data.eccc.body'/>
              </ListGroupItem>
              <ListGroupItem
                header={T.getString(this.context, 'about.credits.data.wcrp.header')}
                href={T.getString(this.context, 'about.credits.data.wcrp.href')}
              >
                <T item='about.credits.data.wcrp.body'/>
              </ListGroupItem>
              <ListGroupItem
                header={T.getString(this.context, 'about.credits.data.usdoe.header')}
                href={T.getString(this.context, 'about.credits.data.usdoe.href')}
              >
                <T item='about.credits.data.usdoe.body'/>
              </ListGroupItem>
            </ListGroup>
          </HalfWidthCol>
        </Row>

      </Grid>
    );
  }
}

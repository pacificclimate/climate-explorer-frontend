import React from "react";
import { Grid, Row } from "react-bootstrap";
import {
  FullWidthCol,
  HalfWidthCol,
} from "../../layout/rb-derived-components.jsx";
import T from "pcic-react-external-text";
import List from "../../guidance-tools/List.jsx";

export default class ClimateExplorer extends React.Component {
  static contextType = T.contextType;

  render() {
    return (
      <Grid fluid>
        <Row>
          <FullWidthCol>
            <T path="about.pcex.title" />
          </FullWidthCol>
        </Row>

        <Row>
          <HalfWidthCol>
            <List
              items={T.get(this.context, "about.pcex.items", {
                version: __APP_VERSION__,
              })}
            />
          </HalfWidthCol>
        </Row>
      </Grid>
    );
  }
}

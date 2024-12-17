import React from "react";
import { Grid, Row } from "react-bootstrap";
import { FullWidthCol, HalfWidthCol } from "../../layout/rb-derived-components";
import T from "pcic-react-external-text";
import List from "../../guidance-tools/List";

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
                version: process.env.REACT_APP_APP_VERSION ?? "Not specified",
              })}
            />
          </HalfWidthCol>
        </Row>
      </Grid>
    );
  }
}

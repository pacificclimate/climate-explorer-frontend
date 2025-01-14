import React from "react";
import { Grid, Row } from "react-bootstrap";
import { FullWidthCol, HalfWidthCol } from "../../layout/rb-derived-components";
import T from "pcic-react-external-text";

import "../styles.css";

export default class HelpGeneral extends React.Component {
  static contextType = T.contextType;

  render() {
    return (
      <Grid fluid className="markdown">
        <Row>
          <FullWidthCol>
            <T path="help.general.title" />
          </FullWidthCol>
        </Row>

        <Row>
          <HalfWidthCol>
            <T
              path="help.general.sections"
              data={{ IMAGES: `${window.env.PUBLIC_URL}/images` }}
            />
          </HalfWidthCol>
        </Row>
      </Grid>
    );
  }
}

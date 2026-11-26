import React from "react";
import { Container, Row } from "react-bootstrap";
import {
  FullWidthCol,
  HalfWidthCol,
} from "../../layout/rb-derived-components.jsx";
import T from "pcic-react-external-text";
import List from "../../guidance-tools/List.jsx";

export default class Team extends React.Component {
  static contextType = T.contextType;

  render() {
    return (
      <Container fluid>
        <Row>
          <FullWidthCol>
            <T path={"about.team.title"} />
          </FullWidthCol>
        </Row>

        <Row>
          <HalfWidthCol>
            <List items={T.get(this.context, "about.team.items")} />
          </HalfWidthCol>
        </Row>
      </Container>
    );
  }
}

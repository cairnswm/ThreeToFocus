import React from "react";
import Navigation from "../../application/Navigation";
import Button from "../../components/Button";
import Alert from "../../components/Alert";
import Badge from "../../components/Badge";
import Container from "../../components/Container";
import Grid from "../../components/Grid";
import Row from "../../components/Row";
import Col from "../../components/Col";
import WebShare from "../../components/WebShare";
import { accessElf } from "../../auth/utils/accessElf";
import ButtonGroup from "../../components/ButtonGroup";
import Card from "../../components/Card";

function HomePage() {
  accessElf.track("HomePage");
  return (
    <Container fluid>
      <Navigation />
      <div className="p-2">
        <div className="flex flex-col items-center px-4">
          <h1 className="text-2xl font-bold">Home</h1>
          <p className="text-gray-600">Welcome to the home page!</p>
        </div>
        <WebShare withUrl={false}>
          <div className="flex flex-col items-center">
            <img
              style={{ width: "100%", maxWidth: "800px" }}
              src="data:image/jpeg;base64,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"
            />
            Sharable!
          </div>
        </WebShare>
        <div className="p-2">
          <Button variant="primary" size="sm" className="me-2">
            Primary
          </Button>
          <Button variant="secondary" size="lg">
            Secondary
          </Button>
        </div>
        <div className="p-2">
          <ButtonGroup>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>

            <Button variant="info">Info</Button>
          </ButtonGroup>
        </div>
        <div className=" px-2">
          <Alert variant="success">This is a success alert!</Alert>
          <Alert variant="danger">This is a danger alert!</Alert>
        </div>
        <div className=" px-2">
          <Badge variant="primary">Primary Badge</Badge>
          <Badge variant="secondary">Secondary Badge</Badge>
        </div>
        <div className="py-3 px-2">
          <Grid>
            <Row>
              <Col
                xs={6}
                sm={4}
                md={3}
                lg={2}
                className="text-center font-bold"
              >
                h1
              </Col>
              <Col
                xs={6}
                sm={4}
                md={3}
                lg={2}
                className="text-center font-bold"
              >
                h2
              </Col>
              <Col
                xs={6}
                sm={4}
                md={3}
                lg={2}
                className="text-center font-bold"
              >
                h3
              </Col>
              <Col
                xs={6}
                sm={4}
                md={3}
                lg={2}
                className="text-center font-bold"
              >
                h4
              </Col>
            </Row>
            <Row>
              <Col xs={6} sm={4} md={3} lg={2}>
                Row 1, Col 1
              </Col>
              <Col xs={6} sm={4} md={3} lg={2}>
                Row 1, Col 2
              </Col>
              <Col xs={6} sm={4} md={3} lg={2}>
                Row 1, Col 1
              </Col>
              <Col xs={6} sm={4} md={3} lg={2}>
                Row 1, Col 2
              </Col>
            </Row>
          </Grid>
        </div>
      </div>
      <div className="p-2">
        <Grid>
        <Row>
          <Col xs={12} md={6} lg={4}>
            <Card>
              <Card.Header>
                <h1>Card Header</h1>
              </Card.Header>
              <Card.Body>
                <p>This is a simple card body.</p>
              </Card.Body>
              <Card.Footer>
                <Button variant="primary">Card Footer</Button>
              </Card.Footer>
            </Card>
          </Col>
          <Col xs={12} md={6} lg={4}>
            <Card>
              <Card.Header>
                <h1>Card Header</h1>
              </Card.Header>
              <Card.Body>
                <p>This is a simple card body.</p>
              </Card.Body>
              <Card.Footer>
                <Button variant="primary">Card Footer</Button>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
        </Grid>
      </div>
    </Container>
  );
}

export default HomePage;

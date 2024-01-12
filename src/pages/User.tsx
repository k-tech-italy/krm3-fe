import React from 'react';
import { useGetCurrentUser } from "../hooks/commons";
import LoadSpinner from "../components/commons/LoadSpinner";
import {
    Button,
    Card,
    Form,
    Container,
    Row,
    Col
} from "react-bootstrap";
import BreadcrumbMission from '../components/commons/Breadcrumb';

export function User() {
    const user = useGetCurrentUser();

    return (
        <>
            {!!user ? (


                <Container fluid>
                    <BreadcrumbMission page={[{ title: 'Home', url: '/#' }, { title: 'Profile', url: '' }]} />
                    <Row>
                        <Col md="8">
                            <Card>
                                <Card.Header>
                                    <Card.Title as="h4">Edit Profile</Card.Title>
                                </Card.Header>
                                <Card.Body>
                                    <Form>
                                        <Row>
                                            <Col className="pr-1" md="3">
                                                <Form.Group>
                                                    <label>Username</label>
                                                    <Form.Control
                                                        value={user.username}
                                                        placeholder="Username"
                                                        type="text"
                                                    ></Form.Control>
                                                </Form.Group>
                                            </Col>
                                            <Col className="pl-1" md="4">
                                                <Form.Group>
                                                    <label htmlFor="exampleInputEmail1">
                                                        Email address
                                                    </label>
                                                    <Form.Control
                                                        value={user.email}
                                                        placeholder="Email"
                                                        type="email"
                                                    ></Form.Control>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col className="pr-1" md="6">
                                                <Form.Group>
                                                    <label>First Name</label>
                                                    <Form.Control
                                                        value={user.firstName}
                                                        placeholder="First name"
                                                        type="text"
                                                    ></Form.Control>
                                                </Form.Group>
                                            </Col>
                                            <Col className="pl-1" md="6">
                                                <Form.Group>
                                                    <label>Last Name</label>
                                                    <Form.Control
                                                        value={user.lastName}
                                                        placeholder="Last Name"
                                                        type="text"
                                                    ></Form.Control>
                                                </Form.Group>
                                            </Col>
                                        </Row>


                                        <button
                                            className="mt-2 btn btn-primary text-end"
                                            type="button"
                                        >
                                            Update Profile
                                        </button>
                                        <div className="clearfix"></div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md="4">
                            <Card className="card-user">
                                <div className="card-image bg-warning">

                                </div>
                                <Card.Body>
                                    <div className="author">

                                        <img
                                            alt="..."
                                            className="avatar border-gray"
                                            src="https://avatars.githubusercontent.com/u/6311869?s=40&v=4"
                                        ></img>
                                        <h5 className="title">{user.firstName} {user.lastName}</h5>

                                        <p className="description">id: {user.id}</p>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>

            ) : (<LoadSpinner />)}</>
    );
}
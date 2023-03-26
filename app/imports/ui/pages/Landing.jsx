import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ROLE } from '../../api/role/Role';
import { Button, Col, Container, Image, Row } from "react-bootstrap";
import { Google, Apple, Meta, Whatsapp, Instagram, Youtube, Android, Facebook } from "react-bootstrap-icons";
import { PAGE_IDS } from '../utilities/PageIDs';
import { Link } from "react-router-dom";

/* A simple static component to render some text for the landing page. */
const Landing = () => {
    const { currentUser } = useTracker(() => ({
        currentUser: Meteor.user() ? Meteor.user().username : '',
    }), []);
    return (
        <div className="off-white-background">
            {currentUser ? '' : (
                <>
                    <Container id={PAGE_IDS.LANDING} className="py-5">
                        <Row className="align-middle text-center">
                            <Col xs={5}>
                                <h1><b>Secure Passwords Made <span className="purple-text">Simple</span></b></h1>
                                <h3 className="mt-3 gray-text">Keep Your Passwords Safe and Sound</h3>
                                <Link to="/signup">
                                    <Button className="mt-3 bg-black" size="lg"><b>Sign Up</b></Button>
                                </Link>
                            </Col>

                            <Col xs={7} className="d-flex flex-column justify-content-center">
                                <Image rounded className="img-fluid" alt="password image" src="https://images.ctfassets.net/lzny33ho1g45/password-security-p-img/72f3ab78724796a0990219ee8ed495c7/file.png?w=1520&fm=jpg&q=30&fit=thumb&h=760" />
                            </Col>
                        </Row>
                    </Container>
                    <div className="light-orange-background">
                        <Container id={PAGE_IDS.LANDING} className="py-5">
                            <Row className="align-middle text-center justify-content-md-center">
                                <Col md={6}>
                                    <h1><b>Trusted by over 100+ Companies Worldwide.</b></h1>
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <Google size={50}/>
                                        <Apple size={50}/>
                                        <Meta size={50}/>
                                        <Facebook size={50}/>
                                        <Instagram size={50}/>
                                        <Youtube size={50}/>
                                        <Whatsapp size={50}/>
                                        <Android size={50}/>
                                    </div>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                </>
            )}
        </div>
    )

};

export default Landing;

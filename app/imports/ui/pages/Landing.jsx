import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Button, Col, Container, Image, Row } from 'react-bootstrap';
import { Google, Apple, Meta, Whatsapp, Instagram, Youtube, Android, Facebook } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { PAGE_IDS } from '../utilities/PageIDs';
import { Passwords } from '../../api/password/PasswordCollection';
import EditPasswordModal from '../components/EditPasswordModal';
import DeletePasswordModal from '../components/DeletePasswordModal';

const CryptoJS = require('crypto-js');

// Retrieve all passwords
// const passwords = Passwords.find().fetch();
// const owner = Meteor.user().username;

// Retrieve passwords belonging to the current user
// const owner = Meteor.user().username;
// passwords = Passwords.find({ owner }).fetch();
/* A simple static component to render some text for the landing page. */
const Landing = () => {
  const [passwordIds, setPasswordIds] = useState([]);
  const { currentUser } = useTracker(() => ({
    currentUser: Meteor.user() ? Meteor.user().username : '',
  }), []);
  // eslint-disable-next-line no-unused-vars
  const { passwords, ready } = useTracker(() => {
    const subscription = Passwords.subscribePassword();
    const passwordItems = Passwords.find({}, { sort: { password: 1, website: 1, owner: 1 } }).fetch();
    const rdy = subscription.ready();
    return {
      passwords: passwordItems,
      ready: rdy,
    };
  }, []);
  const handleCheckbox = (event, passwordId) => {
    const clicked = event.target.checked;
    setPasswordIds((prevPasswordIds) => {
      if (clicked) {
        return [...prevPasswordIds, passwordId];
      }
      return prevPasswordIds.filter((id) => id !== passwordId);

    });
  };

  const decrypt = (password) => {

    const key = CryptoJS.enc.Utf8.parse('b75524255a7f54d2726a951bb39204df');
    const iv = CryptoJS.enc.Utf8.parse(password.owner);

    // Decode from text
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(password.password),
    });
    const decryptedFromText = CryptoJS.AES.decrypt(cipherParams, key, { iv: iv });
    return decryptedFromText.toString(CryptoJS.enc.Utf8);
  };

  const isPasswordShown = (passwordId) => passwordIds.includes(passwordId);

  return (
    <div className="off-white-background content">
      {currentUser ? (
        <>{passwords && passwords.length > 0 ?
          (
            <div className="d-flex justify-content-center">
              <table className="table table-hover" style={{ marginLeft: '10%', width: '40%' }}>
                <thead>
                  <tr>
                    <th scope="col">Website</th>
                    <th scope="col" style={{ width: '300px' }}>Password</th>
                    <th scope="col">Actions</th>
                    <th scope="col">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {passwords.map((password) => (
                    <tr key={password._id}>
                      <td>{password.website}</td>
                      <td>
                        {isPasswordShown(password._id) ? decrypt(password) : '*'.repeat(password.password.length > 12 ? 12 : password.password.length)}
                      </td>
                      <td>
                        <input className="ml-2" type="checkbox" onClick={(event) => handleCheckbox(event, password._id)} /> Show Password
                      </td>
                      <td>
                        <EditPasswordModal key={password._id} password={password} />
                        <DeletePasswordModal password={password} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <h1>No passwords found</h1>
          )}{}
        </>
      ) : (
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
                    <Google size={50} />
                    <Apple size={50} />
                    <Meta size={50} />
                    <Facebook size={50} />
                    <Instagram size={50} />
                    <Youtube size={50} />
                    <Whatsapp size={50} />
                    <Android size={50} />
                  </div>
                </Col>
              </Row>
            </Container>
          </div>
        </>
      )}
    </div>
  );
};

export default Landing;

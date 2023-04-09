import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import swal from 'sweetalert';
import { Card, Container, Modal, Button } from 'react-bootstrap';
import { AutoForm, ErrorsField, HiddenField, SubmitField, TextField } from 'uniforms-bootstrap5';
import { useTracker } from 'meteor/react-meteor-data';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import PropTypes from 'prop-types';
import CryptoJS from 'crypto-js';
import { updateMethod } from '../../api/base/BaseCollection.methods';
import LoadingSpinner from './LoadingSpinner';
import { PAGE_IDS } from '../utilities/PageIDs';
import { Passwords } from '../../api/password/PasswordCollection';

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

const encrypt = (unencryptedPassword) => {
  const owner = Meteor.user().username;

  const key = CryptoJS.enc.Utf8.parse('b75524255a7f54d2726a951bb39204df');
  const iv = CryptoJS.enc.Utf8.parse(owner);

  const encryptedCP = CryptoJS.AES.encrypt(unencryptedPassword, key, { iv: iv });
  const password = encryptedCP.toString();
  return password;
};

const EditPasswordModal = ({ password }) => {
  const _id = password._id;
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

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const bridge = new SimpleSchema2Bridge(Passwords._schema);

  const submit = (data) => {
    // eslint-disable-next-line no-shadow,prefer-const
    let { website, password } = data;
    password = encrypt(password);
    const collectionName = Passwords.getCollectionName();
    const updateData = { id: _id, website, password };
    updateMethod.callPromise({ collectionName, updateData })
      .catch(error => swal('Error', error.message, 'error'))
      .then(() => swal('Success', 'Item updated successfully', 'success'));
  };

  return ready ? (
    <Container id={PAGE_IDS.EDIT_PASSWORD_MODAL} className="py-3">
      <Button variant="primary" onClick={handleShow}>
        Edit
      </Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* eslint-disable-next-line react/prop-types */}
          <AutoForm schema={bridge} onSubmit={data => submit(data)} model={{ website: password.website, password: decrypt(password), owner: password.owner }}>
            <Card>
              <Card.Body>
                <TextField name="website" />
                <TextField name="password" placeholder="hello" />
                <SubmitField value="Update" />
                <ErrorsField />
                <HiddenField name="owner" />
              </Card.Body>
            </Card>
          </AutoForm>
        </Modal.Body>
      </Modal>
    </Container>
  ) : <LoadingSpinner />;
};

EditPasswordModal.propTypes = {
  password: PropTypes.shape({
    website: PropTypes.string,
    password: PropTypes.string,
    _id: PropTypes.string,
  }).isRequired,
};

export default EditPasswordModal;

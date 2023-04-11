import React, { useState } from 'react';
import swal from 'sweetalert';
import { Card, Container, Modal, Button, FormLabel } from 'react-bootstrap';
import { AutoForm, ErrorsField, HiddenField, SubmitField, TextField } from 'uniforms-bootstrap5';
import { useTracker } from 'meteor/react-meteor-data';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import PropTypes from 'prop-types';
import { removeItMethod } from '../../api/base/BaseCollection.methods';
import LoadingSpinner from './LoadingSpinner';
import { PAGE_IDS } from '../utilities/PageIDs';
import { Passwords } from '../../api/password/PasswordCollection';
import CryptoJS from 'crypto-js';

const decrypt = (password) => {

  var key = CryptoJS.enc.Utf8.parse('b75524255a7f54d2726a951bb39204df');
  var iv  = CryptoJS.enc.Utf8.parse(password.owner);

  //Decode from text
  var cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Base64.parse(password.password )
  });
  var decryptedFromText = CryptoJS.AES.decrypt(cipherParams, key, { iv: iv});
  return decryptedFromText.toString(CryptoJS.enc.Utf8);
}

const DeletePasswordModal = ({ password }) => {
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
  const submit = () => {
    const collectionName = Passwords.getCollectionName();
    removeItMethod.callPromise({ collectionName, instance: _id })
      .catch(error => swal('Error', error.message, 'error'))
      .then(() => swal('Success', 'Item updated successfully', 'success'));
  };

  return ready ? (
    <Container id={PAGE_IDS.DELETE_PASSWORD_MODAL} className="py-3">
      <Button variant="primary" onClick={handleShow}>
        Delete
      </Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Entry</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AutoForm schema={bridge} onSubmit={data => submit(data)}>
            <Card>
              <Card.Body>
                <FormLabel>
                  Are you sure you would like to delete this entry?
                </FormLabel>
                <TextField name="website" value={password.website}/>
                <TextField name="password" value={decrypt(password)}/>
                <div style={{ display: 'flex', justifyContent: 'space-between'  }}>
                  <SubmitField value="Delete" />
                  <Button onClick={() => handleClose()}>
                    Cancel
                  </Button>
                </div>
                <ErrorsField />
                <HiddenField name="owner" value={password.owner}/>
              </Card.Body>
            </Card>
          </AutoForm>
        </Modal.Body>
      </Modal>
    </Container>
  ) : <LoadingSpinner />;
};

DeletePasswordModal.propTypes = {
  password: PropTypes.shape({
    website: PropTypes.string,
    password: PropTypes.string,
    owner: PropTypes.string,
    _id: PropTypes.string,
  }).isRequired,
};

export default DeletePasswordModal;

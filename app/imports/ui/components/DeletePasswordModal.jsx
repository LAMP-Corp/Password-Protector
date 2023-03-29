import React, { useState } from 'react';
import swal from 'sweetalert';
import { Card, Col, Container, Row, Modal, Button } from 'react-bootstrap';
import { AutoForm, ErrorsField, HiddenField, NumField, SelectField, SubmitField, TextField } from 'uniforms-bootstrap5';
import { useTracker } from 'meteor/react-meteor-data';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { removeItMethod } from '../../api/base/BaseCollection.methods';
import LoadingSpinner from '../components/LoadingSpinner';
import { PAGE_IDS } from '../utilities/PageIDs';
import { Passwords } from "../../api/password/PasswordCollection";
import PropTypes from 'prop-types';

const DeletePasswordModal = ({ password }) => {
  const _id = password._id;
  const {passwords, ready} = useTracker(() => {
    const subscription = Passwords.subscribePassword();
    const passwordItems = Passwords.find({}, { sort: { password: 1, website: 1, owner: 1 } }).fetch();
    const rdy = subscription.ready();
    return {
      passwords: passwordItems,
      ready: rdy
    };
  }, []);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const bridge = new SimpleSchema2Bridge(Passwords._schema);
  const submit = () => {
    const collectionName = Passwords.getCollectionName();
    console.log(_id);
    console.log(password);
    removeItMethod.callPromise({ collectionName, _id })
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
          <AutoForm schema={bridge} onSubmit={data => submit(data)} model={Passwords.findDoc(password._id)}>
            <Card>
              <Card.Body>
                <TextField name="website" />
                <TextField name="password" />
                <SubmitField value="Delete" />
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

DeletePasswordModal.propTypes = {
  password: PropTypes.shape({
    website: PropTypes.string,
    password: PropTypes.string,
    owner: PropTypes.string,
    _id: PropTypes.string
  }).isRequired
};

export default DeletePasswordModal;

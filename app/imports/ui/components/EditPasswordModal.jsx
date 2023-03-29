import React, { useState } from 'react';
import swal from 'sweetalert';
import { Card, Col, Container, Row, Modal, Button } from 'react-bootstrap';
import { AutoForm, ErrorsField, HiddenField, NumField, SelectField, SubmitField, TextField } from 'uniforms-bootstrap5';
import { useTracker } from 'meteor/react-meteor-data';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { updateMethod } from '../../api/base/BaseCollection.methods';
import LoadingSpinner from '../components/LoadingSpinner';
import { PAGE_IDS } from '../utilities/PageIDs';
import { Passwords } from "../../api/password/PasswordCollection";
import PropTypes from 'prop-types';
import { useParams } from 'react-router';

const EditPasswordModal = ({ password }) => {
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
  const submit = (data) => {
    const { website, password } = data;
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
          <AutoForm schema={bridge} onSubmit={data => submit(data)} model={Passwords.findDoc(password._id)}>
            <Card>
              <Card.Body>
                <TextField name="website" />
                <TextField name="password" />
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
    _id: PropTypes.string
  }).isRequired
};

export default EditPasswordModal;

import React, { useState } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { AutoField, AutoForm, ErrorsField, SubmitField } from 'uniforms-bootstrap5';
import swal from 'sweetalert';
import { Meteor } from 'meteor/meteor';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import SimpleSchema from 'simpl-schema';
import { Passwords } from '../../api/password/PasswordCollection';
import { defineMethod } from '../../api/base/BaseCollection.methods';
import { PAGE_IDS } from '../utilities/PageIDs';

const CryptoJS = require('crypto-js');

// Create a schema to specify the structure of the data to appear in the form.
const formSchema = new SimpleSchema({
  website: String,
  password2: String,
});

const bridge = new SimpleSchema2Bridge(formSchema);

/* Renders the AddPassword page for adding a document. */
const AddPassword = () => {
  const [password, setPassword] = useState('password');
  // On submit, insert the data.
  const submit = (data, formRef) => {
    const { website, password2 } = data;
    const owner = Meteor.user().username;

    const key = CryptoJS.enc.Utf8.parse('b75524255a7f54d2726a951bb39204df');
    const iv = CryptoJS.enc.Utf8.parse(owner);

    const encryptedCP = CryptoJS.AES.encrypt(password2, key, { iv: iv });
    // eslint-disable-next-line no-shadow
    const password = encryptedCP.toString();

    const collectionName = Passwords.getCollectionName();
    const definitionData = { website, password, owner };
    defineMethod.callPromise({ collectionName, definitionData })
      .catch(error => swal('Error', error.message, 'error'))
      .then(() => {
        swal('Success', 'Password added successfully', 'success');
        formRef.reset();
      });
  };

  const handleCheckbox = (event) => {
    const clicked = event.target.checked;
    if (!clicked) {
      setPassword('password');
    } else {
      setPassword('');
    }
  };

  // Render the form. Use Uniforms: https://github.com/vazco/uniforms
  let fRef = null;
  return (
    <Container id={PAGE_IDS.ADD_PASSWORD} className="py-3">
      <Row className="justify-content-center">
        <Col xs={5}>
          <Col className="text-center"><h2>Add Password</h2></Col>
          <AutoForm ref={ref => { fRef = ref; }} schema={bridge} onSubmit={data => submit(data, fRef)}>
            <Card>
              <Card.Body>
                <AutoField name="website" />
                <AutoField name="password2" type={password} />
                <input className="mb-3" type="checkbox" onClick={handleCheckbox} /> Show Password
                <SubmitField value="Submit" />
                <ErrorsField />
              </Card.Body>
            </Card>
          </AutoForm>
        </Col>
      </Row>
    </Container>
  );
};

export default AddPassword;

import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import BaseCollection from '../base/BaseCollection';
import { ROLE } from '../role/Role';

export const PasswordPublications = {
  password: 'password',
  passwordAdmin: 'passwordAdmin',
};

class PasswordCollection extends BaseCollection {
  constructor() {
    super('passwords', new SimpleSchema({
      website: String,
      password: String,
      owner: String,
    }));
  }

  /**
   * Defines a new password item.
   * @param website the name of the website
   * @param password the password
   * @param owner the owner
   * @return {String} the docID of the new document.
   */
  define({ website, password, owner }) {
    console.log("Password inputted successfully with data: ", website, password, owner);
    const docID = this._collection.insert({
      password,
      website,
      owner,
    });
    return docID;
  }

  /**
   * Updates the given document.
   * @param docID the id of the document to update.
   * @param website the website.
   * @param password the password.
   */
  update(docID, { website, password }) {
    const updateData = {};
    if (website) {
      updateData.website = website;
    }
    if (password) {
      updateData.password = password;
    }
    this._collection.update(docID, { $set: updateData });
  }

  /**
   * A stricter form of remove that throws an error if the document or docID could not be found in this collection.
   * @param { String | Object } name A document or docID in this collection.
   * @returns true
   */
  removeIt(name) {
    const doc = this.findDoc(name);
    check(doc, Object);
    this._collection.remove(doc._id);
    return true;
  }

  /**
   * Default publication method for entities.
   * It publishes the entire collection for admin and just the password associated to an owner.
   */
  publish() {
    if (Meteor.isServer) {
      // get the passwordCollection instance.
      const instance = this;
      /** This subscription publishes only the documents associated with the logged in user */
      Meteor.publish(PasswordPublications.password, function publish() {
        if (this.userId) {
          const username = Meteor.users.findOne(this.userId).username;
          return instance._collection.find({ owner: username });
        }
        return this.ready();
      });

      /** This subscription publishes all documents regardless of user, but only if the logged in user is the Admin. */
      Meteor.publish(PasswordPublications.passwordAdmin, function publish() {
        if (this.userId && Roles.userIsInRole(this.userId, ROLE.ADMIN)) {
          return instance._collection.find();
        }
        return this.ready();
      });
    }
  }

  /**
   * Subscription method for password owned by the current user.
   */
  subscribePassword() {
    if (Meteor.isClient) {
      return Meteor.subscribe(PasswordPublications.password);
    }
    return null;
  }

  /**
   * Subscription method for admin users.
   * It subscribes to the entire collection.
   */
  subscribePasswordAdmin() {
    if (Meteor.isClient) {
      return Meteor.subscribe(PasswordPublications.passwordAdmin);
    }
    return null;
  }

  /**
   * Default implementation of assertValidRoleForMethod. Asserts that userId is logged in as an Admin or User.
   * This is used in the define, update, and removeIt Meteor methods associated with each class.
   * @param userId The userId of the logged in user. Can be null or undefined
   * @throws { Meteor.Error } If there is no logged in user, or the user is not an Admin or User.
   */
  assertValidRoleForMethod(userId) {
    this.assertRole(userId, [ROLE.ADMIN, ROLE.USER]);
  }

  /**
   * Returns an object representing the definition of docID in a format appropriate to the restoreOne or define function.
   * @param docID
   * @return {{owner: (*|number), condition: *, quantity: *, name}}
   */
  dumpOne(docID) {
    const doc = this.findDoc(docID);
    const website = doc.website;
    const password = doc.password;
    const owner = doc.owner;
    return { website, password, owner };
  }
}

/**
 * Provides the singleton instance of this class to all other entities.
 */
export const Passwords = new PasswordCollection();

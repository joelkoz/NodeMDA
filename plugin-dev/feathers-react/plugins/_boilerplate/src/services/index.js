'use strict';

// Register and initialize all services here...
const exampleService = require('./ExamplePackage/ExampleService');
const accountService = require('./AccountService');
const contact = require('./AddressBook/Contact');
const authentication = require('./authentication');
const user = require('./user');
const mongoose = require('mongoose');
module.exports = function() {
  const app = this;

  mongoose.connect(app.get('mongodb'));
  mongoose.Promise = global.Promise;

  app.configure(authentication);
  app.configure(user);
  app.configure(contact);
  app.configure(accountService);
  app.configure(exampleService);
};

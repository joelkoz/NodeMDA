'use strict';

const authentication = require('feathers-authentication');

module.exports = function() {
  const app = this;

  let config = app.get('auth');

  config.userEndpoint = '/Users';
  config.idField = '_id';

  app.set('auth', config);
  app.configure(authentication(config));
};

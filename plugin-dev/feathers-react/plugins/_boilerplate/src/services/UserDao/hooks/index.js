'use strict';

const globalHooks = require('src/hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;

exports.before = {
  all: [],
  find: [
    auth.verifyToken(),
    auth.populateUser({userEndpoint: '/Users'}),
    auth.restrictToAuthenticated(),
    auth.queryWithCurrentUser({ idField: '_id', as: '_id' })
  ],
  get: [
    auth.verifyToken(),
    auth.populateUser({userEndpoint: '/Users'}),
    auth.restrictToAuthenticated(),
    auth.restrictToOwner({ ownerField: '_id' })
  ],
  create: [
    auth.hashPassword(),
    hooks.disable('external')
  ],
  update: [
    auth.verifyToken(),
    auth.populateUser({userEndpoint: '/Users'}),
    auth.restrictToAuthenticated(),
    auth.restrictToOwner({ ownerField: '_id' })
  ],
  patch: [
    auth.verifyToken(),
    auth.populateUser({userEndpoint: '/Users'}),
    auth.restrictToAuthenticated(),
    auth.restrictToOwner({ ownerField: '_id' })
  ],
  remove: [
    auth.verifyToken(),
    auth.populateUser({userEndpoint: '/Users'}),
    auth.restrictToAuthenticated(),
    hooks.disable('external')
  ]
};

exports.after = {
  all: [hooks.remove('password')],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};

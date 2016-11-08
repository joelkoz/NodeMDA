'use strict';

const globalHooks = require('src/hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;

exports.before = {
  all: [ globalHooks.verifyTokenIfPresent(),
  		 auth.populateUser()],
  get: [],
  create: [ globalHooks.socketServiceThunkAdapter() ],
};

exports.after = {
  all: [],
  get: [],
  create: [],
};

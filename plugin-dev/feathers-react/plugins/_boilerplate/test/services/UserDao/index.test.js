'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('User Data Access service', function() {
  it('registered the users service', () => {
    assert.ok(app.service('/Users'));
  });
});

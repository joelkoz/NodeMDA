'use strict';

const auth = require('feathers-authentication').hooks;

/**
 * This is a modified version of the standard Feathers authorization hook
 * "verifyToken".  The difference is that with this function, the token does
 * NOT have to be present.  This allows users who are authenticated to
 * have the user object populated, but it does not REQUIRE authentication.
 */
module.exports = function(options) {

	  const verifyToken = auth.verifyToken(options);

	  return function (hook) {
	  	  if (hook.params.token) {
	  	  	 // We have a token - process it normally...
	  	  	 return verifyToken.call(this, hook);
	  	  }
	  	  else {
	  	  	// If no token, then skip this hook.
	  	  	return hook;
	  	  }
	  };
};

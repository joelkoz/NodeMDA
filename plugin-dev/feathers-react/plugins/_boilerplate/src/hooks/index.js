const socketServiceThunkAdapter = require('./SocketServiceThunkAdapter');
const serviceCallLogger = require('./ServiceCallLogger');
const verifyTokenIfPresent = require('./VerifyTokenIfPresent');

// Add any common hooks you want to share across services in here.
// 
// Below is an example of how a hook is written and exported. Please
// see http://docs.feathersjs.com/hooks/readme.html for more details
// on hooks.

let hooks = {
	socketServiceThunkAdapter,
	serviceCallLogger,
	verifyTokenIfPresent,
};

module.exports = hooks;

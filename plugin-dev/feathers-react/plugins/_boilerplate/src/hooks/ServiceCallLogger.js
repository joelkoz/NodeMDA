'use strict';

const winston = require('winston');
const cJSON = require('circular-json');

/**
 * A service hook that allows service calls to be logged to the console for debugging purposes.
 */
module.exports = function ServiceCallLogger(options) {

  	  let serviceName = options.serviceName;
  	  let logLevel = options.logLevel;
  	  if (!logLevel) {
  	  	logLevel = 'debug';
  	  }

	  return function (hook) {
	  	  let params;

	  	  // Do not log secret info and/or clutter...
	  	  params = Object.assign({}, hook.params);
	  	  if (params.token) {
	  	  	params.token = '...';
	  	  }
	  	  if (params.password) {
	  	  	params.password = '...';
	  	  }
	  	  if (params.user) {
	  	  		let realUser = hook.params.user;
	  	  		params.user = Object.assign({}, { _id: realUser._id, email: realUser.email, etc: '...'});
	  	  }
	  	  params.req = undefined;
	  	  switch (hook.method) {
	  	  	case 'create':
	      		winston.log(logLevel, `${hook.type} ${serviceName}.${hook.method}(${cJSON.stringify(hook.data)}, ${cJSON.stringify(params)})\n`);
	  	  		break;

	  	  	case 'update':
	  	  	case 'patch':
	      		winston.log(logLevel, `${hook.type} ${serviceName}.${hook.method}(${cJSON.stringify(hook.id)}, ${cJSON.stringify(hook.data)}, ${cJSON.stringify(params)})\n`);
	  	  		break;

	  	  	case 'get':
	  	  	case 'remove':
	      		winston.log(logLevel, `${hook.type} ${serviceName}.${hook.method}(${cJSON.stringify(hook.id)}, ${cJSON.stringify(params)})\n`);
	  	  		break;


	  	  	default:
	      		winston.log(logLevel, `${hook.type} ${serviceName}.${hook.method}(${cJSON.stringify(params)})\n`);
	  	  }
	  };
};

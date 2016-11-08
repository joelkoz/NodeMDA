'use strict';

module.exports = function SocketServiceThunkAdapter(options) {
  return function(hook) {
  		if (hook.type !== 'before') {
  			throw new Error('SocketServiceThunkAdapter should only be used as a "before" hook.');
  		}

  		if (!hook.params.provider) {
  			return hook;
  		}

  		// If the "_op" parameter is passed in as data, move it to the "params" field.
  		if (hook.data._op) {
  			hook.params.op = hook.data._op;
  			hook.data._op = undefined;
  			delete hook.data._op;
  		}

  };
};

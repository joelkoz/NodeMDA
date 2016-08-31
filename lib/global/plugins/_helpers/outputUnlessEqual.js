"use strict";

var Handlebars = require("handlebars");

/**
 * Will output the contents of the partial block if param1 and param2 are not exactly equal,
 * otherwise, the contents of the {{else}} block will be output.
 */
var outputUnlessEqual = function(param1, param2, options) {
	if (param1 !== param2) {
	    return options.fn(this);
	}
	else {
		return options.inverse(this);
	}
};

module.exports = outputUnlessEqual;

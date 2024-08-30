"use strict";

var Handlebars = require("handlebars");

var safePreserve = function(className, safeName) {

	if (className === safeName) {
		return 'preserve!';
	}
	else {
		return 'preserve';
	}
};

module.exports = safePreserve;

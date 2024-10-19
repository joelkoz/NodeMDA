"use strict";

var Handlebars = require("handlebars");

var lowercase = function(str) {

	if (str !== undefined && str !== null) {
		// Escape the specified string so it is a valid string literal, then
		// remove the quotes.
		return str.toLowerCase();
    }	
    else {
    	return "";
    }
};

module.exports = lowercase;
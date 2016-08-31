"use strict";

var Handlebars = require("handlebars");

var jsStringEscape = function(str) {

	if (str !== undefined && str !== null) {
		// Escape the specified string so it is a valid string literal, then
		// remote the quotes.
    	return JSON.stringify(str).slice(1, -1);
    }	
    else {
    	return "";
    }

};

module.exports = jsStringEscape;

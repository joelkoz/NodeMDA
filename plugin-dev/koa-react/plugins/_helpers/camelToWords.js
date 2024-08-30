"use strict";

var Handlebars = require("handlebars");

var camelToWords = function(str) {

	if (str !== undefined && str !== null) {
        return str
           .replace(/([a-z])([A-Z])/g, '$1 $2')  // Add space before capital letters
           .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')  // Handle consecutive capitals (e.g., "XMLHttpRequest")
           .replace(/^./, str => str.toUpperCase()); // Capitalize the first letter        
    }	
    else {
    	return "";
    }
};

module.exports = camelToWords;

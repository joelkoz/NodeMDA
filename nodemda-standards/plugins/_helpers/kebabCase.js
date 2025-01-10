"use strict";

var Handlebars = require("handlebars");

var kebabCase = function(str) {

	if (str !== undefined && str !== null) {
        return str
           .replace(/([a-z])([A-Z])/g, '$1-$2') // Add dash between lowercase and uppercase letters
           .toLowerCase(); // Convert the entire string to lowercase       
    }	
    else {
    	return "";
    }
};

module.exports = kebabCase;

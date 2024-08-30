"use strict";

var Handlebars = require("handlebars");

var lowercaseFirst = function(str) {

	if (str !== undefined && str !== null) {
        return str
           .replace(/^./, str => str.toLowerCase()); // Lower case the first letter        
    }	
    else {
    	return "";
    }
};

module.exports = lowercaseFirst;

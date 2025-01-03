"use strict";

var Handlebars = require("handlebars");

var uppercaseFirst = function(str) {

	if (str !== undefined && str !== null) {
        return str
           .replace(/^./, str => str.toUpperCase()); // Upper case the first letter        
    }	
    else {
    	return "";
    }
};

module.exports = uppercaseFirst;

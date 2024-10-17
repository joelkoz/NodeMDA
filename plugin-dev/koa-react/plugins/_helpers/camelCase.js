"use strict";

var Handlebars = require("handlebars");

var camelCase = function(str) {

	if (str !== undefined && str !== null) {
        return str
        .toLowerCase()
        .split(/[ .]+/)   // Split by spaces or periods
        .map((word, index) => 
            index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join('');  
    }	
    else {
    	return "";
    }
};

module.exports = camelCase;

"use strict";

var Handlebars = require("handlebars");

var initJSNamespace = function(namespaceName) {

    if (typeof namespaceName === "function") {
    	namespaceName = namespaceName.call(this);
    }
	var paths = namespaceName.split(".");
    var result = "var ";
    var parentPath = "";
    for (var i = 0; i < paths.length; i++) {
    	var nsName = parentPath + paths[i];
    	if (i === 0) {
    	    result += nsName + " = exports;\n";
    	}
    	else {
    	    result += nsName + " = " + nsName + " || {};\n";
    	}
    	parentPath = parentPath + paths[i] + ".";
    } // for
    
    return new Handlebars.SafeString(result);
};

module.exports = initJSNamespace;

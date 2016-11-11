"use strict";

var Handlebars = require("handlebars");

var initJSNamespace = function(varName, namespaceName) {

    if (typeof namespaceName === "function") {
    	namespaceName = namespaceName.call(this);
    }
	var paths = namespaceName.split(".");
    var result = '';
    var parentPath = '';
    for (var i = 0; i < paths.length; i++) {
    	var nsName = parentPath + paths[i];
   	    result += varName + '.' + nsName + " = " + varName + '.' + nsName + " || {};\n";
    	parentPath = parentPath + paths[i] + ".";
    } // for
    
    return new Handlebars.SafeString(result);
};

module.exports = initJSNamespace;

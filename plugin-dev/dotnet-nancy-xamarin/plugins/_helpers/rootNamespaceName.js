"use strict";

var Handlebars = require("handlebars");

var rootNamespaceName = function(namespaceName) {

    if (typeof namespaceName === "function") {
    	namespaceName = namespaceName.call(this);
    }
	var paths = namespaceName.split(".");
    return new Handlebars.SafeString(paths[0]);
};

module.exports = rootNamespaceName;

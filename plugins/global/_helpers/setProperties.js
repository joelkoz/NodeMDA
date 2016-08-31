"use strict";

var Handlebars = require("handlebars");

/**
 * Transfers all hash arguments specified on the setProperties call and
 * makes them top level properties on the context for the partial block.
 * Example:<p>
 * <code>{{#setProperties someKey=someValue}}I set someKey to the value {{this.someValue}}{{/setProperties}}</code>
 */
var setProperties = function(options) {
    var newContext = Handlebars.createFrame(this);
    for (var keyName in options.hash) {
    	var keyValue = options.hash[keyName];
    	newContext[keyName] = keyValue;
    }
	return options.fn(newContext);

};

module.exports = setProperties;

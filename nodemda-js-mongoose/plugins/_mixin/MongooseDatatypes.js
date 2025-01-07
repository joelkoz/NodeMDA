"use strict";

const NodeMDA = require("nodemda");

/*
 * Utility functions to support Javascript code generation 
 */
var MongooseDatatypes = {};

/**
 *  Decorates the NodeMDA data type instances in the model with properties used by this plugin
 *  during code generation.
 */
function configDataTypes(model) {

	// Map primative types to mongoose types...
	model.defineDataSpec('String', { mongooseType: 'String' });
	model.defineDataSpec('Number', { mongooseType: 'Number' });
	model.defineDataSpec('Boolean', { mongooseType: 'Boolean' });
	model.defineObjectType('DateTime', 'Date', { mongooseType: 'Date'});
}


(function() {

	MongooseDatatypes.initPlatform = function(context) {

		let model = context.model;
		console.log("Configuring data types for Mongoose...");
		configDataTypes(model);
	};
})();

module.exports = MongooseDatatypes;

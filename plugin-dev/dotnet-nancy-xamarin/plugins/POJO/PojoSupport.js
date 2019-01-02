"use strict";

const NodeMDA = require("nodemda");

/*
 * Support for the Pojo stereotype.
 */
var PojoSupport = {};

(function() {

	// This method gets called once per run, just before the first class that uses this
	// stereotype is processed.
	PojoSupport.initStereotype = function(context, stereotype) {

		let model = context.model;

		model.mixin({

			onClass: { 
			    get: [ 
	   					function isValueObject() {
	   						return this.stereotypeName === 'ValueObject';
	   					},

	   					function Namespace() {
	   						return context.libraryNamespace + (!this.inRootPackage ? "." + this.packageName : "");
	   					},

	   				  ],

			},

			
		}); // end mixin

	};

	
})();

module.exports = PojoSupport;

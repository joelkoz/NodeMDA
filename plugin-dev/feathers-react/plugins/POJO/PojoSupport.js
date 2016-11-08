"use strict";

const NodeMDA = require("nodemda");

/*
 * Support for the Pojo stereotype.
 */
var PojoSupport = {};

(function() {

	// Use the Joi validation plugin of OmniSchema to help us build
	// a validation object for parameters.
	OmniJoi.plugin();


	// This method gets called for each class in the UML model
	PojoSupport.initClass = function(context, metaClass) {

	}


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
	   				  ],

			},

			
		}); // end mixin

	};

	
})();

module.exports = PojoSupport;

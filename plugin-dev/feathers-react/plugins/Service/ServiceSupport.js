"use strict";

const NodeMDA = require("nodemda");
const OmniSchema = require('omni-schema');
const OmniJoi = require('omni-schema/lib/plugins/validation-joi');


/*
 * Support for the Service stereotype.
 */
var ServiceSupport = {};

(function() {

	// Use the Joi validation plugin of OmniSchema to help us build
	// a validation object for parameters.
	OmniJoi.plugin();


	// This method gets called for each class in the UML model
	ServiceSupport.initClass = function(context, metaClass) {

	}


	// This method gets called once per run, just before the first class that uses this
	// stereotype is processed.
	ServiceSupport.initStereotype = function(context, stereotype) {

		let model = context.model;

		model.mixin({

			onClass: { 
				matches: { stereotypeName: 'Service' },
			    get: [ 
	   					function allowExternalAccess() {
	   						// By default, services are externally available
	   						// They can only be turned off explicitly
	   						if (!this.hasTag('externalAccess')) {
	   							return true;
	   						}
	   						else {
								return this.isTaggedAs('externalAccess');
	   						}
	   					},

	   					function dependentServices() {
	   						let svc = [];
	   						this.dependentClasses.forEach(function (depClass) {
	   							if (depClass.stereotypeName === 'Service' ||
	   								depClass.stereotypeName === 'Entity') {
	   								svc.push(depClass);
	   							}
	   						});
	   						return svc;
	   					},

	   				  ],
			},

			onParameter: {
				get: [
					function joiDefinition() {
						let omniType = this.type.omniSchemaType;
						let joiSpec = omniType.joiSpec;
						let joiFieldCode = 'Joi.' + joiSpec.type + '()';
						if (joiSpec.addOnSpec) {
							joiFieldCode = joiFieldCode.concat(joiSpec.addOnSpec);
						}
						if (this.hasMinValue) {
							joiFieldCode += `.min(${this.minValue})`;
						}
						if (this.hasMaxValue) {
							joiFieldCode += `.max(${this.maxValue})`;
						}
						if (this.isRequired) {
							joiFieldCode += 'required()';
						}
						return joiFieldCode;
					},

					function mockValue() {
						let omniType = this.type.omniSchemaType;
						let fakerSpec = omniType.fakerSpec;
						return JSON.stringify(fakerSpec.getMockData());
					},
				],

			},	
			
		}); // end mixin

	};

	
})();

module.exports = ServiceSupport;

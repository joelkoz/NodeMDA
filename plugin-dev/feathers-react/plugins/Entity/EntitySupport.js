"use strict";

const NodeMDA = require("nodemda");
const OmniSchema = require('omni-schema');
const OmniFaker = require('omni-schema/lib/plugins/mock-faker');


/*
 * Support for the Entity stereotype.
 */
var EntitySupport = {};

(function() {


	// This method gets called for each class in the UML model
	EntitySupport.initClass = function(context, metaClass) {

		// Build an OmniSchema for this class so we can mock a record...
		let schemaTemplate = {};
		this.attributes.forEach(function(attrib) {
			schemaTemplate[attrib.name] = { type: attrib.omniSchemaTypeName };
		});

		metaClass.schema = OmniSchema.compile(schemaTemplate);
	}


	// This method gets called once per run, just before the first class that uses this
	// stereotype is processed.
	EntitySupport.initStereotype = function(context, stereotype) {

		let model = context.model;

		model.mixin({

			onClass: { 
				match: { stereotypeName: 'Entity' },
			    get: [ function isUserOwned() {
								return this.isTaggedAs('userOwned');
	   					},

	   					function allowExternalAccess() {
	   						// By default, external access if OFF.
	   						// It has to be turned on explicitly
							return this.isTaggedAs('externalAccess');
	   					},

	   					function doCrud() {
	   						return this.allowExternalAccess && !this.isTaggedAs('noCrud');
	   					},

	   					function outputMockRecord() {
	   						return JSON.stringify(this.schema.getMockData(), null, 4);
	   					}
	   				  ],
			},

			onAttribute: {
				get: [
					function uiExclude() {
						return this.isTaggedAs('uiExclude');
					}
				],

			},	
			
		}); // end mixin

	};

	
})();

module.exports = EntitySupport;

"use strict";

const NodeMDA = require("nodemda");

/*
 * Support for the Entity stereotype.
 */
var EntitySupport = {};

(function() {
	// This method gets called once per run, just before the first class that uses this
	// stereotype is processed.
	EntitySupport.initStereotype = function(context, stereotype) {

		let model = context.model;

		model.mixin({

			onClass: { 
				matches: { stereotypeName: 'Entity' },
			    get: [ function isUserOwned() {
								return this.isTaggedAs('userOwned');
	   					},

	   					function doCrud() {
	   						return this.allowExternalAccess && !this.isTaggedAs('noCrud');
	   					},

	   					function outputMockRecord() {
	   						let mockRec = JSON.stringify(this.schema.getMockData(), null, 4);

	   						return mockRec.replace(/"/g, '\'');
	   					},

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

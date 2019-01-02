"use strict";

const NodeMDA = require("nodemda");
const _ = require('lodash');

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
			    			if (this.isSubClass) {
			    				return this.parentClass.isUserOwned;
			    			}
			    			else {
								return this.isTaggedAs('userOwned');
			    			}
	   					},

	   					function doCrud() {
	   						return this.allowExternalAccess && !this.isTaggedAs('noCrud');
	   					},

	   					function outputMockRecord() {
	   						let mockRec = JSON.stringify(this.schema.getMockData(), null, 4);

	   						return mockRec.replace(/"/g, '\'');
	   					},

	   					function entityVarName() {
	   						return _.lowerFirst(this.name);
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

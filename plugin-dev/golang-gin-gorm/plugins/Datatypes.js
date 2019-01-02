"use strict";

const NodeMDA = require("nodemda");
const OmniSchema = require('omni-schema');
const OmniFaker = require('omni-schema/lib/plugins/mock-faker');

/*
 * Utility functions to support Javascript code generation 
 */
var Datatypes = {};


/**
 *  Decorates the NodeMDA data type instances in the model with properties used by this plugin
 *  during code generation.
 */
function initDataTypes(model) {

	let OmniTypes = OmniSchema.Types;
	let Types = model.Types;

	// A helper function that decorates the data type with the property 'omniSchemaType'.
	// Not that this assumes that the data type and omni-schema type share the EXACT same
	// name.
	function defineDataSpec(name, props, baseType) {
		model.defineDataType(name, Object.assign({ omniSchemaType: OmniTypes[name] }, props), baseType);
	}


	function defineObjectType(name, goClassName, props, baseType) {
		defineDataSpec(name, Object.assign({ goTypeName: 'interface{}', goClassName }, props), baseType);
	}



	// The primative types...
	defineDataSpec('String', { goTypeName: 'string', globalDefaultValue: '\'\'' });
	defineDataSpec('Number', { goTypeName: 'float32', globalDefaultValue: '0.0' });
	defineDataSpec('Boolean', { goTypeName: 'bool', globalDefaultValue: false });
	defineDataSpec('DateTime', { goTypeName: 'time', globalDefaultValue: 'time.Now()', goImport: 'time' });


	function defineStringType(name, props) {
		defineDataSpec(name, props, Types.String);
	}

	function defineNumericType(name, props) {
		defineDataSpec(name, props, Types.Number);
	}

	function defineBooleanType(name, props) {
		defineDataSpec(name, props, Types.Boolean);
	}

	function defineDateType(name, props) {
		defineDataSpec(name, props, Types.DateTime);
	}

	// Higher order string types...
	defineStringType('Text');
	defineStringType('FullName');
	defineStringType('FirstName');
	defineStringType('LastName');
	defineStringType('Password');
	defineStringType('Phone');
	defineStringType('Email');
	defineStringType('Url');
	defineStringType('StreetAddress');
	defineStringType('City');
	defineStringType('State');
	defineStringType('PostalCode');
	defineStringType('CreditCardNumber');

	// Higher order numeric types
	defineDataSpec('Integer', { goTypeName: 'int', globalDefaultValue: '0' });
	defineNumericType('Decimal');
	defineNumericType('Currency');

	// The date type...
	defineDateType('Date');
	defineDateType('Time');

	// Common enumerations...
	defineBooleanType('YesNo');
	defineStringType('Sex');
	defineBooleanType('OnOff');
}


(function() {

	Datatypes.initPlatform = function(context) {

		let model = context.model;

		initDataTypes(model);

		// Initialize faker data for use by other templates.
	    OmniFaker.plugin();


		// Add functions to the meta model to assist in code generation...
		model.mixin({

			onType: {
				get: [	
					function goTypeName() {
							if (this.name === 'Object') {
								// This data type is a user modeled object...
								return _.upperFirst(this.className);
							}
							else if (this.goTypeName === 'interface{}') {
								// This is one of the built in Go objects
								return this.goClassName;
							}
							else {
								return this.goTypeName;
							}
					},
				],
			},

		});
	};
	
	
})();

module.exports = Datatypes;

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


	function defineObjectType(name, jsClassName, props, baseType) {
		defineDataSpec(name, Object.assign({ jsTypeName: 'object', jsClassName }, props), baseType);
	}



	// The primative types...
	defineDataSpec('String', { jsTypeName: 'string', _csTypeName: 'string', globalDefaultValue: '\'\'' });
	defineDataSpec('Number', { jsTypeName: 'number', _csTypeName: 'double', globalDefaultValue: '0' });
	defineDataSpec('Boolean', { jsTypeName: 'boolean', _csTypeName: 'bool', globalDefaultValue: false });
	defineObjectType('DateTime', 'Date', { _csTypeName: 'DateTime', csRequiredImport: 'System', globalDefaultValue: 'new Date()' });


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
	defineNumericType('Integer', { _csTypeName: 'int' });
	defineNumericType('Decimal', { _csTypeName: 'decimal' });
	defineNumericType('Currency', { _csTypeName: 'decimal' });

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
					function javascriptTypeName() {
							if (this.name === 'Object') {
								// This data type is a user modeled object...
								return this.className;
							}
							else if (this.jsTypeName === 'object') {
								// This is one of the built in Javascript objects
								return this.jsClassName;
							}
							else {
								return this.jsTypeName;
							}
					},
				],
			},

			onAbstractVariable: {
				get: [	
					function javascriptTypeName() {
						return this.type.javascriptTypeName;
			   		},
			

					function omniSchemaTypeName() {
						return this.type.omniSchemaType.name;
			   		},

					function jsDefaultValue() {
						if (this.hasDefaultValue) {
							let jsValue = this.type.omniSchemaType.fromString(this.defaultValue);
							return JSON.stringify(jsValue);
						}
						else if (this.isArray) {
							return "[]";
						}
						else if (this.isObject) {
							return "new " + this.type.jsClassNameWithPath() + "()";
						}
						else {
							return this.type.globalDefaultValue;
						}
					},
				],
			},

			onOperation: {
				get: [
					function jsReturnType() {
						if (this.hasReturnType) {
							return this._returnType.javascriptTypeName;
						}
						else {
							return "";
						}
					},
				],
			},

		});
	};
	
	
})();

module.exports = Datatypes;

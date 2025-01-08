"use strict";

const NodeMDA = require("nodemda");
const OmniSchema = require('omni-schema');
const winston = require("winston");

/*
 * Utility functions to support Javascript code generation 
 */
var StandardDatatypes = {};


// Define a mixin function so we can define our own Enumeration datatype...
const EnumerationBehavior = Base => class extends Base {

    constructor(...args) {
        super(...args);
    }

    addOption(opt) {
        if (typeof opt === 'string') {
            this._options.push(opt);
        } else {
            throw new Error('Enumeration option must be a string');
        }
    }

    setOptions(opts) {
        if (Array.isArray(opts) && opts.every(val => typeof val === 'string')) {
			this._options.length = 0;
			this._options.push(...opts);
        } else {
            throw new Error('Options must be an array of strings');
        }
    }

    getOptions() {
		return this._options;
	}

    get options() {
		 return this._options;
    }

    get mantineInputTag() { return 'Select'; }
    
    get mantineData() { return `{ ${JSON.stringify(this._options)} }`; }
        
	get jsOptionList() { return JSON.stringify(this._options); }
};


// The mixin function to allow us to add the EnumerationBehavior to our new data type...
function applyEnumerationBehavior(target) {
    const Behavior = EnumerationBehavior(Object);
    const instance = new Behavior();

    // Copy properties from the instance to the target object	
	Object.assign(target, instance);

    // Copy methods and getter/setters from the instance to the target object
    Object.getOwnPropertyNames(Behavior.prototype).forEach(name => {
        if (name !== 'constructor') {
            const descriptor = Object.getOwnPropertyDescriptor(Behavior.prototype, name);

            if (typeof descriptor.value === 'function') {
                // It's a method; bind it to the instance
				target[name] = descriptor.value;
            } else {
                // It's a getter/setter or non-function property; define it on the target
                Object.defineProperty(target, name, descriptor);
            }
        }
    });

    return target;
}


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
	defineDataSpec('String', { jsTypeName: 'string', globalDefaultValue: '\'\'' });
	defineDataSpec('Number', { jsTypeName: 'number', globalDefaultValue: '0' });
	defineDataSpec('Boolean', { jsTypeName: 'boolean', globalDefaultValue: false, });
	defineObjectType('DateTime', 'Date', { globalDefaultValue: 'new Date()'  });
    
	
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

	defineStringType('Enumeration', { isEnum: true });
	applyEnumerationBehavior(Types.Enumeration);


	defineBooleanType('BooleanEnum', { isBoolEnum: true });
	applyEnumerationBehavior(Types.BooleanEnum);


    function defineEnumerationType(name, options) {
		defineDataSpec(name, { _options: options }, Types.Enumeration);
	}

    function defineBooleanEnumType(name, options) {
		defineDataSpec(name, { _options: options }, Types.BooleanEnum);
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
	defineNumericType('Integer');
	defineNumericType('Decimal');
	defineNumericType('Currency');

	// The date type...
	defineDateType('Date');
	defineStringType('Time');

	// Common enumerations...
	defineBooleanEnumType('YesNo', [ 'No', 'Yes']);

	defineEnumerationType('Sex', ['Male', 'Female', 'Other'] );
	defineBooleanEnumType('OnOff', [ 'Off', 'On']);

	model.defineDataSpec = defineDataSpec;
	model.defineObjectType = defineObjectType;
	model.defineStringType = defineStringType;
	model.defineNumericType = defineNumericType;
	model.defineBooleanType = defineBooleanType;
	model.defineDateType = defineDateType;
	model.defineEnumerationType = defineEnumerationType;
	model.defineBooleanEnumType = defineBooleanEnumType;
}


(function() {

	StandardDatatypes.initPlatform = function(context) {

		let model = context.model;

		winston.info("Initializing Standard Data Types...")
		initDataTypes(model);

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
			
					function jsDefaultValue() {
						if (this.hasDefaultValue) {
							const defaultVal = this.defaultValue;
							if (typeof defaultVal === "string"  && defaultVal.length === 0) {
								// A "blank" default value is really a "not specified" value.
								// Return the "global default" value.
								return this.type.globalDefaultValue;
							}
							if (this.type.omniSchemaType) {
							   let jsValue = this.type.omniSchemaType.fromString(defaultVal);
							   return JSON.stringify(jsValue);
							}
							else {
								return this.defaultValue;
							}
						}
						else if (this.isArray) {
							return "[]";
						}
						else if (this.isObject) {
							return "new " + this.type.jsClassNameWithPath + "()";
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

module.exports = StandardDatatypes;

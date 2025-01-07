"use strict";

const NodeMDA = require("nodemda");


/*
 * Utility functions to support Javascript code generation 
 */
var MantineDatatypes = {};


/**
 *  Decorates the NodeMDA data type instances in the model with properties used by this plugin
 *  during code generation.
 */
function configDataTypes(model) {

	let Types = model.Types;

	// The primative types...
	model.defineDataSpec('String', { mantineInputTag: 'TextInput'});
	model.defineDataSpec('Number', { mantineInputTag: 'NumberInput', mantineAllowDecimal: true});
	model.defineDataSpec('Boolean', { mantineInputTag: 'Checkbox', mantineInputType: 'checkbox' });
	model.defineObjectType('DateTime', 'Date', { mantineInputTag: 'DateInput', mantineValueFormat: 'MM-DD-YYYY HH:mm', mantineTransformPre: (varName) => { return `new Date(${varName})` } });
    

	// Higher order string types...
	model.defineStringType('Text', { mantineInputTag: 'Textarea' });
	model.defineStringType('Password', { mantineInputTag: 'PasswordInput' });
	model.defineStringType('Phone', { mantineInputType: 'tel' });
	model.defineStringType('Email', { mantineInputType: 'email' });
	model.defineStringType('Url', { mantineInputType: 'url' });

	// Higher order numeric types
	model.defineNumericType('Integer', { mantineAllowDecimal: false });
	model.defineNumericType('Decimal', { mantineAllowDecimal: true });
	model.defineNumericType('Currency', { mantineAllowDecimal: true, mantineDecimalScale: 2, mantineFixedDecimalScale: true });

	// The date type...
	model.defineDateType('Date', { mantineValueFormat: 'MM-DD-YYYY' });
	model.defineStringType('Time', { mantineInputTag: 'TimeInput' });

	// Common enumerations...
	Types.YesNo.mantineTransformPre = (varName) => { return `(${varName} ? 'Yes' : 'No')` };
	Types.YesNo.mantineTransformPost = (varName) => { return `(${varName} === 'Yes')` };

	Types.OnOff.mantineTransformPre = (varName) => { return `(${varName} ? 'On' : 'Off')` };
	Types.OnOff.mantineTransformPost = (varName) => { return `(${varName} === 'On')` };
}


(function() {

	MantineDatatypes.initPlatform = function(context) {
		let model = context.model;
		console.log("Configuring data types for Mantine UI...");
		configDataTypes(model);
	};
	
})();

module.exports = MantineDatatypes;

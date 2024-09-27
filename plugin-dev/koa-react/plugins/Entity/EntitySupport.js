"use strict";

const NodeMDA = require("nodemda");
const pluralize = require('pluralize');
const _ = require('lodash');
const OmniSchema = require('omni-schema');
const camelToWords = require('../_helpers/camelToWords');

/*
 * EntitySupport.js
 * Contains code that applies to the Entity class types generated by this
 * koa-react plugin.
 */
var EntitySupport = {};

(function() {

	EntitySupport.initStereotype = function(context, stereotype) {

		let model = context.model;

		model.mixin({

			onAttribute: [ 
			   { get: [

					function mantineInputTag() {
						if (this.isArray && this.type.isEnum) {
							return 'MultiSelect';
						}
						else {
						   return this.type.mantineInputTag;
						}
					},

					/**
					 * mantineOnChange returns the code fragment to to as the value
					 * of the onChange attribute in a Mantine input compontent.
					 */
					function mantineOnChange() {
						if (this.type.mantineInputTag == 'NumberInput') {
							return `(value) => handleChange('${this.jsIdentifierName}', value)`;
						}
						else if (this.type.mantineInputTag == 'DateInput') {
							return `(value) => handleChange('${this.jsIdentifierName}', value)`;
						}
						else if (this.type.mantineInputTag == 'Checkbox') {
							return `(e) => handleChange('${this.jsIdentifierName}', e.currentTarget.checked)`;
						}
						else if (this.type.name == 'YesNo') {
							return `(value) => handleChange('${this.jsIdentifierName}', value === 'Yes')`;
						}
						else if (this.type.name == 'OnOff') {
							return `(value) => handleChange('${this.jsIdentifierName}', value === 'On')`;
						}
						else if (this.type.mantineInputTag == 'Select') {
							return `(value) => handleChange('${this.jsIdentifierName}', value)`;
						}
						else {
							return `(e) => handleChange('${this.jsIdentifierName}', e.target.value)`;
						}

   					},

				   function mantineDataLabel() {
						return camelToWords(this.name);
				   },

				   function mantineValueSuffix() {
						if (this.type.name == 'YesNo') {
							return ' ? "Yes" : "No"';
						}
						else if (this.type.name == 'OnOff') {
							return ' ? "On" : "Off"';
						}
						return '';
				   },


				   function mantineDefaultValue() {
						if (this.type.name == 'YesNo') {
							return this.defaultValue ? "'Yes'" : "'No'";
						}
						else if (this.type.name == 'OnOff') {
							return this.defaultValue ? "'On'" : "'Off'";
						}

						return this.jsDefaultValue;
				   },

				   function visibleToForm() {
					  return this.isPublic;
				   },

				   function visibleToTable() {
					  return this.isTaggedAs('uiTableColumn');
				   },

				]},

			],

		}); // end mixin

	};

	
})();

module.exports = EntitySupport;
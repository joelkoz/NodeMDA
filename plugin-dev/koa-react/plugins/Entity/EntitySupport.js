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
					  return this.isPublic && !this.isTaggedAs('uiExclude');
				   },

				   function visibleToTable() {
					  return this.isTaggedAs('uiTableColumn');
				   },

				   function useArrayEditor() {
					   return this.isArray && !this.type.isEnum;
				   }
				]},

			],

			onClass: { 
				get: [
					/**
					* Returns a list of all attributes should be included
					* on any input forms generated for this class.
					*/ 
					function formAttribs() {
						let attribs = [];

						this.attributes.forEach(function (attrib) {
							if (attrib.visibleToForm) {
								attribs.push(attrib);
							}
						});

						this.virtuals.forEach(function (attrib) {
							if (attrib.visibleToForm) {
								attribs.push(attrib);
							}
						});

						return attribs;
					},
				] 
			},

		}); // end mixin

		// Make sure there are attributes in each Entity class that are tagged as
		// "uiTableColumn".  If NO attributes have the explicit tag, then ALL
		// attributes get the tag.
		model.classes.forEach(function (metaClass) {
			if (metaClass.stereotypeName === 'Entity') {

				// Count the visibleToTable attributes
				let visibleCount = 0;
				metaClass.attributes.forEach(function (attrib) {
					if (attrib.visibleToTable) {
						visibleCount++;
					}
				});

				if (visibleCount === 0) {
					metaClass.attributes.forEach(function (attrib) {
						attrib.addTag(new NodeMDA.Meta.Tag("uiTableColumn", true));
					});
				}
			}
		});

	};

	
})();

module.exports = EntitySupport;

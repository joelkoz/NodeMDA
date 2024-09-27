"use strict";

var NodeMDA = require("nodemda");

/*
 * Utility functions to support Javascript code generation 
 */
var Datatypes = Datatypes || {};

(function() {

	/**
	 * Map that translates the NodeMDA common data types to various Javascript
	 * data types:
	 * jsTypeName = the string returned by typeof()
	 * jsonSchemaTypeName = the string used in the JSON Schema specification
	 */
	var JavascriptDatatypes = [
	    {  metaTypeName: "String",
	       jsTypeName: "string",
	       jsonSchemaTypeName: "string",
	       globalDefaultValue: "\"\"",
	    },

	    {  metaTypeName: "Integer",
	       jsTypeName: "number",
	       jsonSchemaTypeName: "integer",
	       globalDefaultValue: "0",
	    },
	    
	    {  metaTypeName: "Date",
	       jsTypeName: "string",
	       jsonSchemaTypeName: "string",
	       globalDefaultValue: "null",
	    },
	    
	    {  metaTypeName: "Time",
	       jsTypeName: "string",
	       jsonSchemaTypeName: "string",
	       globalDefaultValue: "null",
	    },
			    
	    {  metaTypeName: "DateTime",
	       jsTypeName: "string",
	       jsonSchemaTypeName: "string",
	       globalDefaultValue: "null",
	    },
			    
	    {  metaTypeName: "Boolean",
	       jsTypeName: "boolean",
	       jsonSchemaTypeName: "boolean",
	       globalDefaultValue: "false",
	    },
	    
	    {  metaTypeName: "JSON",
	       jsTypeName: "string",
	       jsonSchemaTypeName: "string",
	       globalDefaultValue: "\"\"",
	    },
	    
	    {  metaTypeName: "Decimal",
	       jsTypeName: "number",
	       jsonSchemaTypeName: "number",
	       globalDefaultValue: "0.0",
	    },
	    
	    {  metaTypeName: "Currency",
	       jsTypeName: "number",
	       jsonSchemaTypeName: "number",
	       globalDefaultValue: "0.0",
	    },
	    
	    {  metaTypeName: "Object",
	       jsTypeName: "object",
	       jsonSchemaTypeName: "object",
	       globalDefaultValue: "{}",
	    },
		    
	];
	
	
	/**
	 * Searches for and returns a "type info" object from the
	 * JavascriptDatatypes[] array that matches the specified
	 * metaDatatype (assuming one can be located).  If no
	 * such datatype is found, null is returned.
	 */
	Datatypes.getTypeInfo = function(metaDatatype) {
		if (metaDatatype.elementName === "Datatype") {
			for (var i = 0; i < JavascriptDatatypes.length; i++) {
				var jsdt = JavascriptDatatypes[i];
	    	    if (jsdt.metaTypeName === metaDatatype.name) {
	    	    	return jsdt;
	    	    }
	    	}
	    }	
	    
	    return null;
	};

	
	/**
	 * Returns a string that is the Javascript datatype equivalent of
	 * the specified meta datatype.  If no match can be found, "???"
	 * is returned.
	 */
	Datatypes.toJavascriptType = function(metaDatatype) {
		if (metaDatatype.name === "Object") {
		    return metaDatatype.className;	
		}
		else {
			var jsdt = Datatypes.getTypeInfo(metaDatatype);
			if (jsdt !== null) {
				return jsdt.jsTypeName;
			}
			else {
				return "???";
			}
		}
	};
	

	/**
	 * Returns a string that is the Javascript datatype equivalent of
	 * the specified meta datatype.  If no match can be found, "???"
	 * is returned.
	 */
	Datatypes.toJSONSchemaType = function(metaDatatype) {
		var jsdt = Datatypes.getTypeInfo(metaDatatype);
		if (jsdt !== null) {
			return jsdt.jsonSchemaTypeName;
		}
		else {
			return "???";
		}
	};
	
	
	
	Datatypes.initPlatform = function(context) {

		// Decorate all the meta "Datatype" objects with
		// additional getters to output the language specific
		// data types...
		NodeMDA.Meta.AbstractVariable.prototype.javascriptTypeName = function() {
	    	return Datatypes.toJavascriptType(this.type);
	    };	
			
			
	    NodeMDA.Meta.AbstractVariable.prototype.jsonSchemaTypeName = function() {
	    	return Datatypes.toJSONSchemaType(this.type);
	    };	
	    
	};
	
	
	/**
	 * Returns a string that represents the "default value" that should
	 * be output.  This default value will either be the value explicitly
	 * set by a tagged value, or it will be the default value for the datatype.
	 */
	NodeMDA.Meta.AbstractVariable.prototype.jsDefaultValue = function() {
		if (this.hasDefaultValue) {
			return this.defaultValue;
		}
		else if (this.isArray) {
			return "[]";
		}
		else if (this.isObject) {
			return "new " + this.type.jsClassNameWithPath + "()";
		}
		else {
			var jsdt = Datatypes.getTypeInfo(this.type);
			return jsdt.globalDefaultValue;
		}
    };	


    
	NodeMDA.Meta.Operation.prototype.jsReturnType = function() {
		if (this.hasReturnType) {
			return Datatypes.toJavascriptType(this._returnType);
		}
		else {
			return "";
		}
	};
	
})();

module.exports = Datatypes;

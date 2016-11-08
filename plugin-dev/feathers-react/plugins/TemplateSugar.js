"use strict";

var NodeMDA = require("nodemda");

/*
 * Utility functions to make template generation much easier. Functions
 * added to object prototypes can be executed as if they are properties
 * on the objects used in the templates.  Care must be taken, however,
 * to ensure that the context of the Template properly reflects the
 * object being called. In Handlebars, "this" resolves to the template
 * context. To make sure the template context matches the object 
 * that owns the method being invoked, use the {{#with}} directive.
 * <p>Example<p>
 * <code>
 *   {{#with class as |currentClass|}}
 *      {{currentClass.hasObjectAttributes}}
 *   {{/with}}
 * </code>
 */
var TemplateSugar = {};

(function() {

    /**
     * Takes a string and translates it into a valid Javascript identifier.
     */
    TemplateSugar.jsPathToIdentifier = function(packagePath) {
    	if (typeof packagePath === "string") {
    		return packagePath.replace(new RegExp("\\" + NodeMDA.Options.packageDelimeter, "g"), ".");
    	}
    	else {
    		return "";
    	}
    };
    

	TemplateSugar.initPlatform = function(context) {

		let model = context.model;

		model.mixin({

			onAttribute: {
				get: [
					/**
					 * jsIdentifierName is the name to use as the identifier name
					 * for an attribute in a class when generating Javascript code. 
					 * The convention used is that read only and private variables are prefixed
					 * with the "_" character.
					 */
					function jsIdentifierName() {
						if (this.isReadOnly || !this.isPublic) {
							// A private variable...
							return "_" + this.name;
						}
						else {
							return this.name;
						}

   					},
				],
			},


			onObjectDatatype: {
				get: [
				    /**
				     * Translates the metamodel's path delimeter into a Javascript appropriate
				     * identifier.
				     */
				    function jsClassNameWithPath() {
	    	   			return TemplateSugar.jsPathToIdentifier(this.classNameWithPath);
				   	}
				],
			},


			onClass: {
				get: [
				    /**
				     * Translates the metamodel's path delimeter into a Javascript appropriate
				     * identifier.
				     */
					function jsClassNameWithPath() {
	    	   			return TemplateSugar.jsPathToIdentifier(this.classNameWithPath);
					},
					

				    /**
				     * Translates the metamodel's package name to a valid Javascript identifier.
				     */
					function jsPackageName() {
	    	   			return TemplateSugar.jsPathToIdentifier(this.packageName);
					},
				],		

			},

			onMetaElement: {
				get: [
				    /**
				     * Returns an array of strings representing the comment of the object,
				     * broken down into individual lines that are no longer than (approx) maxCharsPerLine
				     * long.
				     */
	    			function jsCommentsFormatted() {
				    	var maxCharsPerLine = 80;
				    	var lineList = [];
				    	
				    	if (this.hasComment) {
				    		var words = this.comment.split(" ");
				    		var line = "";
				    		var lineLen = 0;
				    		for (var w = 0; w < words.length; w++) {
				    			var nextWord = words[w];
				    			var nextWordLen = nextWord.length;

				    			if (lineLen + nextWordLen > maxCharsPerLine) {
				    				line = line.replace(new RegExp("\\n", "g"), "<p>");
				    				lineList.push(line);
				    				line = "";
				    				lineLen = 0;
				    			}
				    			
				    			if (lineLen > 0) {
				    				line += " ";
				    				lineLen++;
				    			}
				    			
				    			line += nextWord;
				    			lineLen += nextWordLen;
				    		} // for
				    		
				    		if (lineLen > 0) {
			    				line = line.replace(new RegExp("\\n", "g"), "<p>");
				    			lineList.push(line);
				    		}
				    	}
				    	
				    	return lineList;
					},
				],
			},
		}); // end mixin

	};

	
})();

module.exports = TemplateSugar;

"use strict";

var NodeMDA = require("nodemda");

/*
 * Utility functions to make Javascript template generation easier.
 */
var Transformations = Transformations || {};

(function() {

	    /**
	     * Transforms all associations specified in the metaClass
	     * into "Array" attributes, returning them as an array of
	     * NodeMDA.Meta.Attribute objects.
	     */
	    var assocsToArrayAttribs = function(metaClass) {
	    	var attribs = [];
	    	metaClass.associations.forEach(function(metaAssoc) {
	    		var otherEnd = metaAssoc.otherEnd; 
	    	   if (otherEnd._navigable) {
	    		   var attrib = new NodeMDA.Meta.Attribute(otherEnd.name, otherEnd.type);
	    		   attrib._multiplicity = otherEnd._multiplicity;
	    		   attrib._public = otherEnd._public;
	    		   attrib._comment = otherEnd._comment;
	    		   attribs.push(attrib);
	    	   }	
	    	});
	    	return attribs;
	    };
	
	    
	    /**
	     * In Javascript, associations to other objects are handled as
	     * simply array properties.  This function sets the "attributes" 
	     * property on the specified meta class to be 
	     * an array of NodeMDA.Attribute objects that combines the actual
	     * attributes with the associations. The original attribute
	     * list and association list are saved in jsOriginalAttributes and
	     * jsOriginalAssociations in case they are needed by another plugin.
	     */
	    var makeJSAttributeList = function(metaClass) {
	       var jsAttributeList = metaClass.attributes.concat(assocsToArrayAttribs(metaClass));
	       metaClass.jsOriginalAttributes = metaClass.attributes;
	       metaClass.attributes = jsAttributeList;
	       metaClass.jsOriginalAssociations = metaClass.associations;
	       metaClass.associations = [];
	    };
	    
	    
		Transformations.initClass = function(context, metaClass) {
			makeJSAttributeList(metaClass);
			
			// And go ahead and make the pseudo attribute list on the associated classes...
			metaClass.associations.forEach(function(metaAssoc) {
				var otherEnd = metaAssoc.otherEnd;
				if (otherEnd._navigable) {
					var subMeta = metaAssoc.otherEnd.type.metaClass;
					if (typeof(subMeta.jsOriginalAttributes) === "undefined") {
					    makeJSAttributeList(subMeta);
					}
				}
			});
		};
	
})();

module.exports = Transformations;

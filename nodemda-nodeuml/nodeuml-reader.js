/*
Copyright (C) 2024 by Joel Kozikowski

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */

"use strict";

var NodeMDA = require('nodemda');
var MetaModel = NodeMDA.Meta;
var Reader = Reader || {};

var fs = require('fs');
var winston = require('winston');


/**
 * In all places in this code, properties prefixed with "uml" refer to elements that
 * come from the NodeUML file.  Properties prefixed with "meta" are MetaModel
 * objects or references.
 */
(function(){

	/**
	 * Map that translates uml actor ids into NodeMDA Actor meta objects.
	 */
	var metaActors = {};


	/**
	 * Map that translates uml stereotype ids into NodeMDA stereotype meta objects.
	 */
	var metaStereotypes = {};

	
	/**
	 * Map that translates uml datatype ids into NodeMDA datatype meta objects.
	 */
	var metaDatatypes = {};
	
	/**
	 * Will hold the meta datatype that represents the String type once the UML
	 * Datatypes have been processed.
	 */
	var dtString = null;

	/**
	 * Map that translates uml class ids into NodeMDA class meta objects.
	 */
	var metaClassMap = {};


	/**
	 * An array that holds a list of all NodeMDA class meta objects that have been processed.
	 */
	var processedMetaClasses = [];
	

	/**
	 * An array that holds a list of all NodeUML class meta objects that have been processed.
	 */
	var processedUmlClasses = [];
	
	
	/**
	 * A Queue of all dependencies that need to be 
	 * processed after all classes have been read in to insure the metaClassMap
	 * is fully populated.
	 */
	var umlDependencyQueue = [];

	
	/**
	 * A Queue of all generalizations that need to be 
	 * processed after all classes have been read in to insure the metaClassMap
	 * is fully populated.
	 */
	var umlGeneralizationQueue = [];


	
	/**
	 * A Queue of all associations that need to be 
	 * processed after all classes have been read in to insure the metaClassMap
	 * is fully populated.
	 */
	var umlAssociationQueue = [];
	

	/**
	 * Searches the child elements of the specified umlElement and returns
	 * a list of all child elements that are of the specified umlTypeName.
	 */
	var getOwnedElementsOfType = function(umlElement, umlTypeName) {
		var results = [];
		var ownedElements = umlElement.ownedElements;
		if (ownedElements) {
			ownedElements.forEach(function(umlOwned) {
				var typeId = umlOwned._type;
				if (typeId === umlTypeName) {
					results.push(umlOwned);
				}
			});
		}
		
		return results;
	};
	
	
	/**
	 * Returns the meta Datatype that is associated with the specified
	 * uml Datatype (i.e. resolves which meta Datatype was created from
	 * which uml datatype id).
	 */
	var resolveDataType = function(umlDataTypeId) {
		
		// Look for native types first...
		var dt = metaDatatypes[umlDataTypeId];
		
		if (typeof dt === 'undefined') {
			// If its not a native type, perhaps its a class from
			// the uml model?
			var metaClass = metaClassMap[umlDataTypeId];
			if (typeof metaClass !== 'undefined') {
				// It IS one of our classes.  Create an "Object" data type for this class
				var metaTypeObject = new MetaModel.ObjectDatatype(metaClass.getPackageName(), metaClass.getName());
				dt = metaTypeObject;
				
				// Cache the id for later use...
				metaDatatypes[umlDataTypeId] = metaTypeObject;
			}
			else {
				// Is it an Actor?
				let metaActor = metaActors[umlDataTypeId];
				if (typeof metaActor !== 'undefined') {
					// This is an ID of an actor.
					dt = metaActor;
				}
			}
		}
		
		if (typeof(dt) === "undefined" || dt === null) {
			winston.warn("Could not resolve uml Datatype id of " + umlDataTypeId);
		}		
				
		return dt;
	};


	/**
	 * Resolves a data type using a NodeUML "reference" object
	 * (i.e. one with a "$ref" property). This function will
	 * safely return null if the reference object or the $ref
	 * property is not valid.
	 */
	var resolveDataTypeReference = function(umlReferenceObj) {
		if (typeof(umlReferenceObj) === "object" && "$ref" in umlReferenceObj) {
			return resolveDataType(umlReferenceObj.$ref);
		}
		
		winston.warn("Unable to resolve uml datatype reference " + JSON.stringify(umlReferenceObj));
		return null;
	};
	
	
	/**
	 * Returns the full meta Class object that is referenced by
	 * the specified umlReferenceObj, or NULL if no such object
	 * can be found.
	 */
	var resolveClassReference = function(umlReferenceObj) {
		if (typeof(umlReferenceObj) === "object" && "$ref" in umlReferenceObj) {
			if (typeof(umlReferenceObj.$ref) === "string") {
			    return metaClassMap[umlReferenceObj.$ref];
			}
		}
		
		return null;
	};
	
	
	/**
	 * Checks the specified umlElement to see if any documentation exists.
	 * If it does, it is copied to the "comment" property of the specified
	 * metaElement.
	 */
	var checkForComment = function(umlElement, metaElement) {
		if ("comment" in umlElement) {
			metaElement._comment = umlElement.comment;
		}
	};
	
	
	/**
	 * Checks the specified umlElement to see if any tags exist.
	 * If they do, they are added to the specified metaElement.
	 */
	var checkForTags = function(umlElement, metaElement) {
	    if ("tags" in umlElement) {
	    	umlElement.tags.forEach(function(tag) {
	    	   var metaTag = new MetaModel.Tag(tag.name, tag.value);
	    	   metaElement.addTag(metaTag);
	    	});
	    }	
	};
	
	
	var readActors = function(umlParentElement) {
		let stList = getOwnedElementsOfType(umlParentElement, "UMLActor");
		stList.forEach(function (umlActor) {
			let metaActor = new MetaModel.Actor(umlActor.name);
			metaActor._visibility = umlActor.visibility;
			metaActors[umlActor._id] = metaActor;
		});
	}


	var readStereotypes = function(umlParentElement) {
		let stList = getOwnedElementsOfType(umlParentElement, "UMLStereotype");
		stList.forEach(function (umlStereotype) {
			metaStereotypes[umlStereotype._id] = new MetaModel.Stereotype(umlStereotype.name);
		});
	}


	var readDatatypes = function(umlParentElement) {
		let dtList = getOwnedElementsOfType(umlParentElement, "UMLDataType");
		dtList.forEach(function (umlDatatype) {
			metaDatatypes[umlDatatype._id] = new MetaModel.Datatype(umlDatatype.name);
			if (umlDatatype.name === 'String') {
				dtString = metaDatatypes[umlDatatype._id];
			}
		});
	}


	/**
	 * Processes the specified umlProfile element and extracts stereotypes and
	 * data types, creating the NodeMDA Meta versions of them.
	 */
	var readProfile = function(umlParentElement) {

		// First, find all of the profile elements in this parent element...
		readActors(umlParentElement);
		readStereotypes(umlParentElement);
		readDatatypes(umlParentElement);

		// Now, if there are any packages, search each of those for stereotypes and 
		// data types...
		let packageList = getOwnedElementsOfType(umlParentElement, "UMLPackage");
		packageList.forEach(function (umlPackage) {
			readProfile(umlPackage);
		});

	};
	
	
	
	var queueRelationships = function(umlClass, umlQueue, umlRelationshipTypeName) {
		var relationshipList = getOwnedElementsOfType(umlClass, umlRelationshipTypeName);
		relationshipList.forEach(function (umlRelationship) {
			umlQueue.push(umlRelationship);
		});
	};

	
	var readClassAttributesAndOperations = function(umlClass) {
		
		var metaClass = metaClassMap[umlClass._id];
		
		const attributes = getOwnedElementsOfType(umlClass, "UMLAttribute");
		// Now, create the attributes...
		if (attributes.length > 0) {
			attributes.forEach(function(umlAttribute) {
			    var attrType = resolveDataTypeReference(umlAttribute.type);
			    var metaAttribute = new MetaModel.Attribute(umlAttribute.name, attrType);
			    metaAttribute._visibility = umlAttribute.visibility;
			    metaAttribute._readOnly = umlAttribute.isReadOnly;
			    metaAttribute._static = umlAttribute.isStatic;
			    metaAttribute._unique = umlAttribute.isUnique;
			    metaAttribute._defaultValue = umlAttribute.defaultValue;
			    if ("multiplicity" in umlAttribute) {
			    	metaAttribute._multiplicity = umlAttribute.multiplicity;
			    }
			    checkForComment(umlAttribute, metaAttribute);
			    checkForTags(umlAttribute, metaAttribute);
			    metaClass.addAttribute(metaAttribute);
			});
		}

		// Now, gather the operations...
		const operations = getOwnedElementsOfType(umlClass, "UMLOperation");
		if (operations.length > 0) {
			operations.forEach(function(umlOperation) {
				var metaOperation = new MetaModel.Operation(umlOperation.name, null);
				checkForComment(umlOperation, metaOperation);
				checkForTags(umlOperation, metaOperation);
				
				metaOperation._visibility = umlOperation.visibility;
				metaOperation._static = umlOperation.isStatic;
				
				const parameters = getOwnedElementsOfType(umlOperation, "UMLParameter");
				if (parameters.length > 0) {
					// process the parameters of the operations...
					parameters.forEach(function (umlParameter) {
						var paramType = resolveDataTypeReference(umlParameter.type);
						if (paramType === null) {
							var msgPrefix;
							if (typeof(umlParameter.name) === "undefined") {
								msgPrefix = "Unnamed parameter  ";
							}
							else {
								msgPrefix = "Parameter name " + umlParameter.name;
							}
							if (typeof(umlParameter.type.$ref) === "undefined") {
								winston.error(msgPrefix + 
										      " in operation " + umlOperation.name + 
										      " of class " + umlClass.name +
										      " references a datatype (named " + umlParameter.type + 
										      ") that is not a Datatype nor Class that is in the model. Use Datatypes from profile or modeled classes only.");
							}
							else {
								winston.error(msgPrefix + 
									      " in operation " + umlOperation.name + 
									      " of class " + umlClass.name +
									      " has an invalid datatype reference id: " + umlParameter.type.$ref); 
							}
						}
						if ("name" in umlParameter) {
							// A named parameter...
							var metaParam = new MetaModel.Parameter(umlParameter.name, paramType);
						    if ("multiplicity" in umlParameter) {
						    	metaParam._multiplicity = umlParameter.multiplicity;
						    }
						    if ("visibility" in umlParameter) {
						        metaParam._visibility = umlParameter.visibility;
						    }
						    if ("isUnique" in umlParameter) {
						        metaParam._unique = umlParameter.isUnique;
						    }
						    if ("defaultValue" in umlParameter) {
						        metaParam._defaultValue = umlParameter.defaultValue;
						    }
						    
							checkForComment(umlParameter, metaParam);
							checkForTags(umlParameter, metaParam);
							metaOperation.addParameter(metaParam);
						}
					});
				}
				
				metaOperation._returnType = resolveDataTypeReference(umlOperation.returnType);

				metaClass.addOperation(metaOperation);
			});
		}
	};
	
	/**
	 * Processes a umlClass, translating it into a MetaModel.Class object
	 */
	var readClass = function(metaPackage, umlClass) {

		var metaClass = new MetaModel.Class(umlClass.name);
		checkForComment(umlClass, metaClass);
		checkForTags(umlClass, metaClass);
		if (metaPackage !== null) {
			metaClass.setPackage(metaPackage);
		}

		metaClass._visibility = umlClass.visibility;

		if ("stereotypes" in umlClass && umlClass.stereotypes.length > 0) {
		
			var umlStereotypeId = umlClass.stereotypes[0].$ref;
			var metaStereotype = metaStereotypes[umlStereotypeId];

			if (typeof(metaStereotype) === "object") {
			    metaClass.addStereotype(metaStereotype);
			}
		}
		


		
		metaClassMap[umlClass._id] = metaClass;
		processedMetaClasses.push(metaClass);
		processedUmlClasses.push(umlClass);
	
	};
	
	
	/**
	 * Processes a uml Package element, extracting and processing all Class
	 * elements that are inside of it.
	 */
	var readPackage = function(previousPackagePath, umlPackage) {

		var packageName = "";
		if (previousPackagePath.length > 0) {
			packageName = previousPackagePath + NodeMDA.Options.packageDelimeter;
		}
		
		packageName += umlPackage.name;
		
		var	metaPackage = new MetaModel.Package(packageName);
		
		metaPackage._visibility = umlPackage.visibility;

		readActors(umlPackage);		

		var classList = getOwnedElementsOfType(umlPackage, "UMLClass");
		classList.forEach(function(umlClass) {
			readClass(metaPackage, umlClass);
		});

		if ("ownedElements" in umlPackage) {
			queueRelationships(umlPackage, umlGeneralizationQueue, "UMLGeneralization");
			queueRelationships(umlPackage, umlAssociationQueue, "UMLAssociation");
			queueRelationships(umlPackage, umlDependencyQueue, "UMLDependency");
		}		

		// Recursively process any child packages...
		var packageList = getOwnedElementsOfType(umlPackage, "UMLPackage");
		packageList.forEach(function(umlPack2) {
			readPackage(packageName, umlPack2);
		});
		
	};

	
	
	var readModel = function(umlModel) {

		readActors(umlModel);
		
		var packageList = getOwnedElementsOfType(umlModel, "UMLPackage");
		packageList.forEach(function (umlPackage) {
			readPackage("", umlPackage);
		});
		
		// Look for "packageless" classes and process those...
		var classList = getOwnedElementsOfType(umlModel, "UMLClass");
		classList.forEach(function(umlClass) {
			readClass(null, umlClass);
		});

		if ("ownedElements" in umlModel) {
			queueRelationships(umlModel, umlGeneralizationQueue, "UMLGeneralization");
			queueRelationships(umlModel, umlAssociationQueue, "UMLAssociation");
			queueRelationships(umlModel, umlDependencyQueue, "UMLDependency");
		}		
	};
	
	
	
	/** 
	 * Attach the dependencies to the appropriate classes
	 */
	var processDependencyQueue = function() {
		umlDependencyQueue.forEach(function(umlDependency) {
			var metaMe = resolveClassReference(umlDependency.end1.node);
			if (metaMe !== null) {
			    var metaOther = resolveDataTypeReference(umlDependency.end2.node);
				let metaDependency = new MetaModel.Dependency(metaOther);
			    metaMe.addDependency(metaDependency);
				checkForTags(umlDependency, metaDependency);
			}
		});
	};

	
	
	/** 
	 * Attach the generalizations to the appropriate classes
	 */
	var processGeneralizationQueue = function() {
		umlGeneralizationQueue.forEach(function(umlGeneralization) {
			var metaMe = resolveClassReference(umlGeneralization.end1.node);
			if (metaMe !== null) {
			    var metaOther = resolveDataTypeReference(umlGeneralization.end2.node);
			    metaMe.addGeneralization(new MetaModel.Generalization(metaOther));
			}
		});
	};
	

	/**
	 * Creates and populates a meta AssociationEnd from its
	 * UML counterpart.
	 */
	var makeAssocEnd = function(umlEnd) {
		var metaEnd = new MetaModel.AssociationEnd();
		metaEnd._name = umlEnd.name;
		metaEnd._multiplicity = umlEnd.multiplicity;
		metaEnd._navigable = umlEnd.navigable || (!umlEnd.navigable && umlEnd.name);
		metaEnd._aggregation = false;
		metaEnd._composition = false;
		metaEnd._visibility = umlEnd.visibility;
		return metaEnd;
	};
	
	
	/** 
	 * Attach the associations to the appropriate classes
	 */
	var processAssociationQueue = function() {
		umlAssociationQueue.forEach(function(umlAssociation) {
			var metaClass1 = resolveClassReference(umlAssociation.end1.node);
			var metaClass2 = resolveClassReference(umlAssociation.end2.node);
			if (metaClass1 !== null && metaClass2 !== null) {
				var metaEnd1 = makeAssocEnd(umlAssociation.end1);
				metaEnd1._type = resolveDataTypeReference(umlAssociation.end1.node);

				var metaEnd2 = makeAssocEnd(umlAssociation.end2);
				metaEnd2._type = resolveDataTypeReference(umlAssociation.end2.node);
				
				if (metaEnd2._navigable) {
					var metaAssoc1 = new MetaModel.Association(metaEnd1, metaEnd2);
					metaClass1.addAssociation(metaAssoc1);
				}
				
				if (metaEnd1._navigable) {
					var metaAssoc2 = new MetaModel.Association(metaEnd2, metaEnd1);
					metaClass2.addAssociation(metaAssoc2);
				}
			}
		});
	};
	

	
	/**
	 * Makes a second pass over the UML classes, resolving attributes and
	 * operations, and its parameters. This second pass is made to ensure
	 * references to class objects in the model can be properly resolved
	 * to the NodeMDA counterparts.
	 */
	var reprocessUmlClassQueue = function() {
		processedUmlClasses.forEach(function(umlClass) {
			readClassAttributesAndOperations(umlClass);
		});
	};

	
	/**
	 * Reads the contents of the specified NodeUML file and translates it
	 * into a NodeMDA meta model.
	 */
	Reader.getMeta = function(fileName) {
		
		winston.info("Loading NodeUML meta model from " + fileName);
		
		var json = JSON.parse(fs.readFileSync(fileName, 'utf8'));
		
		var projectName = json.name;
		
		// Cache up data types and stereotypes from the UMLProfiles
		var umlProfiles = getOwnedElementsOfType(json, "UMLProfile");
		umlProfiles.forEach(function (umlProfile) {
			readProfile(umlProfile);
		});
		
		metaClassMap = {};
		processedMetaClasses = [];

		
		// Now, process each model in the project...
		var umlModels = getOwnedElementsOfType(json, "UMLModel");
		umlModels.forEach(function (umlModel) {
		    readModel(umlModel);
		});
	    
		// Make a second pass to resolve attributes and operation parameters...
		reprocessUmlClassQueue();		
		
		// Process relationships
		processDependencyQueue();
		processGeneralizationQueue();
		processAssociationQueue();
		
		
		// Finally, package up the results...
		var datatypeArray = [];
        for (var prop in metaDatatypes) {
	       datatypeArray.push(metaDatatypes[prop]);
        } // for
        
		var stereotypeArray = [];
        for (prop in metaStereotypes) {
	       stereotypeArray.push(metaStereotypes[prop]);
        } // for

		var actorArray = [];
        for (prop in metaActors) {
	       actorArray.push(metaActors[prop]);
        } // for
        
		return new MetaModel.Model(projectName, datatypeArray, stereotypeArray, actorArray, processedMetaClasses);
	};
	
	
})();

module.exports = Reader;

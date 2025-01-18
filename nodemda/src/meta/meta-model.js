/*
Copyright (C) 2016 by Joel Kozikowski

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

const NodeMDA = require("../nodemda-core.js");
const _ = require('lodash');
const pluralize = require('pluralize');

let MetaModel = {};

(function(meta){


	/**
	 * A tag is a name/value pair that can be attached to any UML element.
	 */
	meta.Tag = class {
		constructor(name, value) {
			this._name = name;
			this._value = value;
		}
	};
	

	/**
	 * All meta objects in the NodeMDA system inherit from MetaElement.
	 */
	meta.MetaElement = class MetaElement {

		constructor(elementName) {
			this.elementName = elementName;
			this.stereotypes = [];
	    	this._comment = null;
			this._visibility = "public";
	    }
		
		addTag(metaTag) {
			if (this.tags === undefined) {
				this.tags = [];
			}
			this.tags.push(metaTag);
		}

		addTagValue(tagName, tagValue) {
			this.addTag(new meta.Tag(tagName, tagValue));
		}

		getClassName() {
	        return Object.getPrototypeOf(this).constructor.name;
		}
		
		/**
		 * Retrieves the value of the specified tag name. If no such tag
		 * exists, "undefined" is returned. 
		 */
		getTagValue(tagName) {
			if (this.tags !== undefined) {
				for (var i = 0; i < this.tags.length; i++) {
					if (this.tags[i]._name === tagName) {
						return this.tags[i]._value;
					}
				}
			}
			return undefined;
		}
		
		hasTag(tagName) {
			return (typeof(this.getTagValue(tagName)) !== "undefined");
		}
		

		/**
		 * A special version of tag handling that returns TRUE if
		 * this element has the specified tag name, AND its value
		 * is a Javascript TRUTHY.
		 */
		isTaggedAs(tagName) {
			return Boolean(this.getTagValue(tagName));
		}


		get comment() {
			return this._comment;
		}
		
		get hasComment() {
			return this._comment !== null;
		}

		get stereotypeName() {
			if (this.stereotypes.length > 0) {
				return this.stereotypes[0].name;
			}
			else {
				return undefined;
			}
		}

		addStereotype(stereotype) {
			this.stereotypes.push(stereotype);
		}
		
		get isPublic() {
			if (typeof this._visibility === 'undefined') {
				// Default value if not specified
				return true;
			}
			else {
  			   return this._visibility === "public";
			}
		}
		
		get isProtected() {
			return this._visibility === "protected";
		}

		get isPrivate() {
			return this._visibility === "private";
		}


		/**
		 * Is this variable visible to other classes inside the package?
		 */
		get isVisible() {
			return this._visibility !== "private";
		}

	};
	
	
	/**
	 * Package is the container or namespace objects belong to
	 */
	meta.Package = class Package extends meta.MetaElement { 
		constructor(name) {
			super("Package");
			this._name = name;
		}
		
		getName() {
			return this._name;
		}
		
		get name() {
			return this._name;	
		}
		
		/**
		 * Returns the package name as an array of individual strings that represents each
		 * path in the package name.
		 */
		get nameAsArray() {
			if (typeof(this.name) === "string") {
				return this.name.split(NodeMDA.Options.packageDelimeter);
			}
			else {
				return [];
			}
		}

		
		/**
		 * Returns the first package name in the package path
		 */
		get rootPackageName() {
		    return this.nameAsArray[0];	
		}


		/**
		 * Returns the first package name in the package path
		 */
		get lastPackageName() {
			let ar = this.nameAsArray;
		    return ar[ar.length - 1];	
		}
		
		
	};
	

	/**
	 * Data types available to the mda engine
	 */
	meta.Datatype = class Datatype extends meta.MetaElement { 
		constructor(name) {
			super("Datatype");
			this._name = name;
		}
		
		getName() {
			return this._name;
		}

		get name() {
			return this._name;	
		}

		get type() {
			return this;
		}
		
		get isObject() {
	    	return (this.getName() === "Object");
		}

		/**
		 * Merges the specified properties in with the pre-existing properties
		 * of this data type. If the property already exists, it is overwritten
		 * with the new value.
		 */		
		mergeProps(props) {
			if (props) {
			    Object.assign(this, props);
			}
		}
	};
	
	
	meta.ObjectDatatype = class ObjectDatatype extends meta.Datatype {

		constructor(packageName, className) {
			super("Object");
			this._className = className;
			this._packageName = packageName;
		}

		get name() {
			return this.className;
		}

		get className() {
			return this._className;
		}
		
		get packageName() {
			return this._packageName;
		}
		
		get classNameWithPath() {
			if (typeof this._packageName === "string" && this._packageName.length > 0) {
			    return this._packageName + NodeMDA.Options.packageDelimeter + this._className;
			}
			else {
				return this._className;
			}
		}

		
		/**
		 * Returns a reference to the NodeMDA.Meta.Class object that this ObjectDatatype references
		 */
	    get metaClass() {
	    	var metaClass = meta.Model.findClass(this.packageName, this.className);
	    	return metaClass;
	    }
	};

	
	meta.Datatype.Void = new meta.Datatype("Void");
	

	/**
	 * Stereotypes available to the mda engine
	 */
    meta.Stereotype = class Stereotype extends meta.MetaElement {

    	constructor(name) {
			super("Stereotype");
    		this._name = name;
    	}
  
    	
    	getName() {
    		return this._name;
    	}
    	
    	
    	get name() {
    		return this._name;
    	}
    	
    };



	/**
	 * Stereotypes available to the mda engine
	 */
    meta.Actor = class Actor extends meta.MetaElement {

    	constructor(name) {
			super("Actor");
    		this._name = name;
    	}
  
    	
    	getName() {
    		return this._name;
    	}
    	
    	
    	get name() {
    		return this._name;
    	}
    	
    };




    /**
     * Variables have name, types, a multiplicity, and an optional default value
     */
    meta.AbstractVariable = class AbstractVariable extends meta.MetaElement {
    	constructor(classTypeName, name, type) {
    		super(classTypeName);
			this._name = name;
			this._type = type;
			this._readOnly = false;
			this._multiplicity = "0..1";
    	}
    	
		getName() {
			return this._name;
		}
		
		get name() {
			return this._name;	
		}
		
		getTypeName() {
			return this._type.getName();
		}
		
		get type() {
			return this._type;
		}
		
		
		get typeName() {
			return this._type.name;
		}


		get isUnique() {
			return this._unique;
		}
		
		get isReadOnly() {
			return this._readOnly;
		}

		get multiplicity() {
			if (typeof this._multiplicity !== 'undefined') {
				return this._multiplicity;
			}
			else {
				return "1";
			}
		}

		get isRequired() {
			return this.multiplicity.charAt(0) === "1";
		}
		
		get isArray() {
			return this.multiplicity.slice(-1) === "*";
		}
		
		get isMany() {
			return this.multiplicity.slice(-1) === "*";
		}


		get isOne() {
			return this.multiplicity.slice(-1) === "1";
		}

		get isObject() {
	    	return (this.type.getName() === "Object");
		}
		
		get hasDefaultValue() {
			return this._defaultValue !== undefined || this.getTagValue("default") !== undefined || this.getTagValue("defaultValue") !== undefined;
		}
		
		get defaultValue() {
			if (this._defaultValue !== undefined) {
				return this._defaultValue;
			}
			else {
				const def = this.getTagValue("default");
				if (def !== undefined) {
					return def;
				}
				const defVal = this.getTagValue("defaultValue");
				if (defVal !== undefined) {
					return defVal;
				}
				else {
					console.error("No default value found for variable " + this._name);
					return "";
				}
			}
		}
		

		get hasMinValue() {
			return this.hasTag('minVal')
		}

		/**
		* Returns the minimum allowed value of this variable, if specified in the model. Otherwise,
		* <code>undefined</code> is returned.
		*/
		get minValue() {
			if (this.hasTag('minVal')) {
				return this.getTagValue('minVal');
			}
			else {
				return undefined;
			}
		}


		get hasMaxValue() {
			return this.hasTag('maxVal')
		}
		/**
		* Returns the maximum allowed value of this variable, if specified in the model. Otherwise,
		* <code>undefined</code> is returned.
		*/
		get maxValue() {
			if (this.hasTag('maxVal')) {
				return this.getTagValue('maxVal');
			}
			else {
				return undefined;
			}
		}

    };
    

    
	/**
	 * Attributes of classes 
	 */
	meta.Attribute = class Attribute extends meta.AbstractVariable {
		constructor(name, type) {
			super("Attribute", name, type);
			this._static = false;
		}
		
		
		get isStatic() {
			return this._static;
		}
		
	};


	/**
	 * Parameters of operations 
	 */
	meta.Parameter = class Parameter extends meta.AbstractVariable { 
		constructor(name, type) {
			super("Parameter", name, type);
		}
	};


	/**
	 * Methods, functions, and other static operations
	 */
	meta.Operation = class Operation extends meta.MetaElement { 
		constructor(name, returnType) {
			super("Operation");
		    this._name = name;
		    this.parameters = [];
		    if (returnType === undefined) {
		       this._returnType = MetaModel.Datatype.Void;
		    } 
		    else {
		       this._returnType = returnType;
		    }
			this._static = false;
		}
		
		addParameter(param) {
			this.parameters.push(param);
		}
		
		get name() {
			return this._name;
		}

		get type() {
		   return this._returnType;	
		}
		
		get isStatic() {
			return this._static;
		}
		
		get hasReturnType() {
			return (typeof(this._returnType) !== "undefined" && this._returnType !== null &&
			        this.name !== "Void");
		}

		get hasParameters() {
			return this.parameters.length > 0;
		}
		
	};
	

	
	/**
	 * When a class is a generalization (i.e. inherits from) another class, it holds
	 * this reference to the base class object.
	 */
	meta.Generalization = class Generalization extends meta.MetaElement {
		constructor(baseObjectDatatype) {
			super("Generalization");
			this._baseObjectDatatype = baseObjectDatatype;
		}
	};



	/**
	 * When a class depends on another object, it holds this reference to the
	 * other object.
	 */
	meta.Dependency = class Dependency extends meta.MetaElement {
		constructor(otherObjectDatatype) {
			super("Dependency");
			this._otherObjectDatatype = otherObjectDatatype;
		}

		get otherObject() {
			return this._otherObjectDatatype;
		}
	};
	
	
	
	/**
	 * Associations between two objects have an "end" at each endpoint
	 * that describes the details of the relationship.
	 */
    meta.AssociationEnd = class AssociationEnd extends meta.AbstractVariable {
        constructor() {
			super("AssociationEnd", null, null);
        	this._multiplicity = "1";
        	this._navigable = true;
        	this._aggregation = false;
        	this._composition = false;
        }	

        /**
         * Returns the name of this association end.  If the name is not explicitly
         * defined in the model, one is synthesized from the type name.
         */
        get name() {
        	if (typeof this._name === "string" && this._name.length > 0) {
        		return this._name;
        	}
        	else {
        	    // Synthesize a name from the type name...
        		let typeName = this._type.className;
        		if (this.isMany) {
        			typeName = pluralize(typeName);
        		}
        		return typeName.charAt(0).toLowerCase() + typeName.slice(1);
        	}
		}

		get isNavigable() {
			return this._navigable;
		}


		get isAggregation() {
			return this._aggregation;
		}


		get isComposition() {
			return this._composition;
		}

    };	
	
    
    /**
     * Assocations between two objects
     */
    meta.Association = class Association extends meta.MetaElement {
    	constructor(myEnd, otherEnd) {
			super("Association");
    		this.myEnd = myEnd;
    		this.otherEnd = otherEnd;
    	}
    };

    

	/**
	 * Class definitions
	 */
	meta.Class = class Class extends meta.MetaElement {
		constructor(name) {
			super("Class");
			this._name = name;
			this.attributes = [];
			this.operations = [];
			this.generalizations = [];
			this.dependencies = [];
			this.associations = [];
			this._package = null;
		}
		
		
		getName() {
		   return this._name;	
		}
		
		
		addAttribute(attr) {
			this.attributes.push(attr);
		}
		
		
		addOperation(op) {
			this.operations.push(op);
		}
	
		
		addGeneralization(generalization) {
		    this.generalizations.push(generalization);	
		}
		
		
		addDependency(dependency) {
			this.dependencies.push(dependency);
		}
		
		
		addAssociation(association) {
			this.associations.push(association);
		}
		
		
		setPackage(pack) {
			this._package = pack;
		}
		
		get inRootPackage() {
			return !Boolean(this._package);
		}
		
		getPackageName() {
			if (this._package !== null) {
				return this._package.getName();
			}
			else {
				return "";
			}
		}
		
		get name() {
			return this.getName();	
		}
			
		get packageName() {
			return this.getPackageName();
		}
		
		get packageDirName() {
			var pName = this.getPackageName();
			pName = pName.replace(new RegExp("\\" + NodeMDA.Options.packageDelimeter, "g"), "/");
			return pName;
		}
		
		/**
		 * Returns the fully qualified name of this class, which includes the complete
		 * package path to the object.
		 */
		get classNameWithPath() {
			if (this._package !== null && this._package.name.length > 0) {
			    return this._package.name + NodeMDA.Options.packageDelimeter + this._name;
			}
			else {
				return this._name;
			}
		}
		

		/**
		* Returns the full path to this class. If separator is specified, the path
		* nodes will be separated with the specified separator character.
		*/
		getClassNameWithPath(separator) {
			let cp = this.classNameWithPath;
			if (separator) {
			   cp = cp.replace(new RegExp("\\" + NodeMDA.Options.packageDelimeter, "g"), separator);
			}
			return cp;
		}


		get isSubClass() {
			return (this.generalizations.length > 0);
		}
		
		get parentClassType() {
			if (this.isSubClass) {
				return this.generalizations[0]._baseObjectDatatype;
			}
			else {
				return null;
			}
		}
		
		get parentClass() {
			var parentType = this.parentClassType;
			if (parentType !== null) {
				return parentType.metaClass;
			}
			else {
				return null;
			}
		}
		
		get hasDepenencies() {
			return (this.dependencies.length > 0);
		}
		
		get hasAssociations() {
			return (this.associations.length > 0);
		}
		
		get hasOperations() {
			return (this.operations.length > 0);
		}

		get hasOperationsWithParams() {
			for (let i = 0; i < this.operations.length; i++) {
				if (this.operations[i].hasParameters) {
					return true;
				}
			}
			return false;
		}
		
		/**
		 * Returns TRUE if this class is not in any explicit package
		 */
		get hasNoPackage() {
			if (this._package === null || typeof(this._package) === "undefined" ||
				this._package.name.length === 0) {
				return true;
			}
			return false;
		}
		
		
	    /**
	     * Returns TRUE if any of the attributes of the class are an Object (vs. a primitive).
	     */
	    get hasObjectAttributes() {
	    	for (var i = 0; i < this.attributes.length; i++) {
	    		if (this.attributes[i].type.isObject) {
	    			return true;
	    		}
	    	} // for
	    	return false;
	    }
	    
	    
		
		/**
		 * Retrieves a list of all attributes that are visible inside of this class.
		 * Only attributes declared in this class are included.
		 * @returns { Attribute[] }
		 */
		get visibleAttributes() {
			var aList = [];
			this.attributes.forEach(function (attribute) {
				if (attribute.isVisible) {
					aList.push(attribute);
				}
			});
			return aList;
		}

		
		_gatherVisibleAttributes(metaClass, classList) {
			if (metaClass !== null) {
				var parentVisible = this._gatherVisibleAttributes(metaClass.parentClass);
				return metaClass.visibleAttributes.concat(parentVisible);
			}
			else {
				return [];
			}
		}
		
		/**
		 * Retrieves a list of all attributes that are visible in all ancestor classes.
		 * The return value does NOT include attributes that are declared in the
		 * current class. 
		 * @returns { Attribute[] }
		 */
		get inheritedVisibleAttributes() {
			var aList = this._gatherVisibleAttributes(this.parentClass);
			return aList;
		}
		
		
		/**
		 * Returns a combination of requiredAttributes() and inheritedRequiredAttributes()
		 */
		get allVisibleAttributes() {
		    var aList = this.visibleAttributes;
		    return this.inheritedVisibleAttributes.concat(aList);
		}
		
		
		/**
		 * Retrieves a list of attributes declared in this class that are marked "required"
		 * @returns { Attribute[] }
		 */
		get requiredAttributes() {
			var aList = [];
			this.attributes.forEach(function (attribute) {
				if (attribute.isRequired) {
					aList.push(attribute);
				}
			});
			return aList;
		}

		
		_gatherRequiredAttributes(metaClass) {
			if (metaClass !== null) {
				var parentRequired = this._gatherRequiredAttributes(metaClass.parentClass);
				return metaClass.requiredAttributes.concat(parentRequired);
			}
			else {
				return [];
			}
		}
		
		
		/**
		 * Retrieves a list of all attributes that are required from ancestor classes.
		 * The return value does NOT include attributes that are declared in
		 * the current class
		 * @returns { Attribute[] }
		 */
		get inheritedRequiredAttributes() {
			var aList = this._gatherRequiredAttributes(this.parentClass);
			return aList;
			
		}
		
		
		/**
		 * Returns a combination of requiredAttributes() and inheritedRequiredAttributes()
		 */
		get allRequiredAttributes() {
		    var aList = this.requiredAttributes;
		    return this.inheritedRequiredAttributes.concat(aList);
		}
		

		/**
		 * Returns an array of all metaClass objects that this class
		 * references. This includes all attributes that have a data type
		 * of that is another class, as well as all association ends that
		 * are classes.
		 */
		get referencedClasses() {
			let refList = [];

			this.attributes.forEach(function (attribute) {
				if (attribute.type instanceof meta.ObjectDatatype) {
					refList.push(attribute.type.metaClass);
				}
			});

			this.associations.forEach(function(assoc) {
				let otherEnd = assoc.otherObject;
				if (otherEnd instanceof meta.ObjectDatatype) {
					refList.push(otherEnd.metaClass);
				}
			});

			return refList;
		}




		/**
		 * Returns an array of all metaClass objects that this class
		 * depends on.
		 */
		get dependentClasses() {
			let depList = [];
			this.dependencies.forEach(function(dep) {
				let otherEnd = dep.otherObject;
				if (otherEnd instanceof meta.ObjectDatatype) {
					depList.push(otherEnd.metaClass);
				}
			});
			return depList;
		}



		/**
		 * Returns an array of all metaActor objects that this class
		 * depends on.
		 */
		get dependentActors() {
			let depList = [];
			this.dependencies.forEach(function(dep) {
				let otherEnd = dep.otherObject;
				if (otherEnd instanceof meta.Actor) {
					depList.push(otherEnd);
				}
			});
			return depList;
		}
	};

	
	meta.Model = class Model extends meta.MetaElement {

		constructor(projectName, datatypes, stereotypes, actors, classes) {
			super("Model");
			this.name = projectName;
			this.datatypes = datatypes;
			this.stereotypes = stereotypes;
			this.actors = actors;
			this.classes = classes;

			let self = this;
			this.Types = {};
			datatypes.forEach(function (datatype) {
				self.Types[datatype.name] = datatype;
			});

			this.Stereotypes = {};
			stereotypes.forEach(function (stereotype) {
				self.Stereotypes[stereotype.name] = stereotype;
			});
		}


		/**
		 * The class version of Model.findClass(), this allows
		 * it to be called without the need for the runtime model
		 * to be set.
		 */
		getMetaClass(packageName, className) {
			return meta.Model.findClass(packageName, className, this);
		}


		/**
		 * Attempts to locate the Meta.Class object that has the specified
		 * package and class name, returning it.  If no such class can be
		 * found in the model, null is returned.
		 */
		static findClass(packageName, className, model) {

			if (typeof(model) === 'undefined') {
			    model = global._nodemda_runtime_model_;
			}

			if (typeof(model) === "undefined") {
				throw new Error("NodeMDA.runtime.model is undefined. Model.findClass() is only available during code generation.");
			}
			
	        for (var i = 0; i < model.classes.length; i++) {
				var metaClass = model.classes[i];
				if (metaClass.name === className && metaClass.packageName === packageName) {
					return metaClass;
				}
			}
			return null;
		};
	

		/**
		 * Defines a new data type with the specified name, or merges the specified
		 * props in with a pre-existing data type of the same name.
		 * @param name {string} The name of the data type to add or update
		 * @param props {object} The properties to attach (or add) to the data type
		 * @param baseType Another data type that serves as the base data type. The
		 *   new data type will inherit behaviors from this baseType if a particular
		 *   plugin does not explicity define behaviors for the data type.
		 */
		defineDataType(name, props, baseType) {

			let dataType;
			if (this.Types[name]) {
			   // Update an existing type definition...
			   dataType = this.Types[name];
			}
			else {
			   // Define a new type definition...
			   dataType = new meta.Datatype(name);
			   this.Types[name] = dataType;
			}

		    dataType.mergeProps(props);

		    if (baseType) {
				Object.setPrototypeOf(dataType, baseType);
				dataType.className = baseType.name;
		    }
		}


		/**
		 * A a helper function for mixin() that is used
		 * to determine if a specific data type matches the "match specification".
		 * A match specification can be:
		 * 1. An object - each property of the object must be present in the data type and the values must match
		 * 2. A string - the specified string is a path to a property that must exist in the data type (indenpendent)
		 *      of its value.
		 * 3. A function - a function that takes a single parameter (the data type), and returns TRUE if the
		 *      data type matches
		 * 4. An array consisting of one or more of the above 3 types.  ALL entries must match for the data type
		 *      to be considered a match (i.e. joined with "logical And").
		 * 5. An object with a single member property named "$or", "$and", or $not. These are expected to have a value
		 *      that is an array of two or more of the above entries. The entries will be joined with logical
		 *      "or", "and", or "not" (i.e. negated truth)
		 */
		static DataTypeMatches(dataType, matchSpec) {

			if (typeof matchSpec === 'undefined') {
				return (dataType instanceof meta.Datatype);
			}
			else if (typeof matchSpec === 'function') {
				return matchSpec(dataType);
			}
			else if (typeof matchSpec === 'string') {
				return _.get(dataType, matchSpec);
			}
			else if (Array.isArray(matchSpec)) {
				for (let i = 0; i < matchSpec.length; i++) {
					let subSpec = matchSpec[i];
					if (!meta.Model.DataTypeMatches(dataType, subSpec)) {
						return false;
					}
				} // for
				return true;
			}
			else if (typeof matchSpec === 'object') {

				if (matchSpec.hasOwnProperty('$or') && Array.isArray(matchSpec['$or'])) {
					let orList = matchSpec['$or'];
					for (let i = 0; i < orList.length; i++) {
						let subSpec = orList[i];
						if (meta.Model.DataTypeMatches(dataType, subSpec)) {
							return true;
						}
					} // for
					return false;
				}

				if (matchSpec.hasOwnProperty('$and') && Array.isArray(matchSpec['$and'])) {
					// Using $and is a long hand for the already specified array processing above
					return meta.Model.DataTypeMatches(dataType, matchSpec['$and']);
				}

				if (matchSpec.hasOwnProperty('$not')) {
					// Return a logical "not" of the specification.
					return !meta.Model.DataTypeMatches(dataType, matchSpec['$not']);
				}

			}

			return _.isMatch(dataType, matchSpec);
		}




		/**
		 * Applies the mixin specification mixinSpec
		 */
		static ApplyMixin(obj, mixinSpec) {

			if (_.has(mixinSpec, 'matches')) {
				// This is a conditional mixinSpec - see if it matches first...
				if (!meta.Model.DataTypeMatches(obj, mixinSpec.matches)) {
					// It does not match, so do not apply the mixinSpec...
					return;
				}
			}


			if (_.has(mixinSpec, 'get')) {
				let mixinValue = mixinSpec.get;
				if (typeof mixinValue === 'function') {
					let name = mixinValue.name;
					Object.defineProperty(obj, name, { get: mixinValue });
				}
				else if (Array.isArray(mixinValue)) {
					mixinValue.forEach(function (subVal) {
						let name = subVal.name;
						Object.defineProperty(obj, name, { get: subVal });
					});
				}
			}

			if (_.has(mixinSpec, 'set')) {
				let mixinValue = mixinSpec.set;
				if (typeof mixinValue === 'function') {
					let name = mixinValue.name;
					Object.defineProperty(obj, name, { set: mixinValue });
				}
				else if (Array.isArray(mixinValue)) {
					mixinValue.forEach(function (subVal) {
						let name = subVal.name;
						Object.defineProperty(obj, name, { set: subVal });
					});
				}
			}

			if (_.has(mixinSpec, 'func')) {
				let mixinValue = mixinSpec.func;
				if (typeof mixinValue === 'function') {
					let name = mixinValue.name;
					obj[name] = mixinValue;
				}
				else if (Array.isArray(mixinValue)) {
					mixinValue.forEach(function (subVal) {
						let name = subVal.name;
						obj[name] = subVal;
					});
				}
			}
		}



		/**
		 * mixin() is the primary means for plugins to extend the functionality of
		 * NodeMDA.  It is used to decorate the various base classes of the meta model
		 * or its data types with additional getters, setters, and/or methods.  See
		 * the readme.me file for specifics on the mixin specification.
		 * @param spec {object} The mixin specification that adheres to the NodeMDA
		 *   plugin mixin specification
		 */
		mixin(spec) {

			if (typeof spec !== 'object') {
				throw new Error('Mixin specification must be an object.');
			}


			// Make sure obj is an array so we can iterate over it if there
			// is more than one.
			function castArray(obj) {
				if (_.isArray(obj)) {
					return obj;
				}
				else {
					return [obj];
				}
			}

			let self = this;

			for (let propName in spec) {
				if (propName.startsWith('on')) {
					if (propName === 'onType') {
						// Apply the spec to each data type that has been defined...
						castArray(spec.onType).forEach(function (subSpec) {
							if (_.has(subSpec, 'matches')) {
								// We have a "matches" specification, so this spec
								// is applicable to only a certain number of types.
								// Apply to each of them...
								_.forEach(self.Types, function(type, key, obj) {
									meta.Model.ApplyMixin(type, subSpec);
								});
							}
							else {
								// This spec applies to ALL of them, so apply it to
								// the prototype...
								meta.Model.ApplyMixin(meta.Datatype.prototype, subSpec);
							}
						});
					}
					else if (propName === 'onStereotype') {
						// Apply the spec to each stereotype that has been defined...
						castArray(spec.onStereotype).forEach(function (subSpec) {
							if (_.has(subSpec, 'matches')) {
								// We have a "matches" specification, so this spec
								// is applicable to only a certain number of stereotypes.
								// Apply to each of them...
								_.forEach(self.Stereotypes, function(stereotype, key, obj) {
									meta.Model.ApplyMixin(stereotype, subSpec);
								});
							}
							else {
								// This spec applies to ALL of them, so apply it to
								// the prototype...
								meta.Model.ApplyMixin(meta.Stereotype.prototype, subSpec);
							}
						});
					}
					else if (propName === 'onClass') {
						// Apply the spec to each stereotype that has been defined...
						castArray(spec.onClass).forEach(function (subSpec) {
							if (_.has(subSpec, 'matches')) {
								// We have a "matches" specification, so this spec
								// is applicable to only a certain number of classes.
								// Apply to each of them...
								self.classes.forEach(function(clazz) {
									meta.Model.ApplyMixin(clazz, subSpec);
								});
							}
							else {
								// This spec applies to ALL of them, so apply it to
								// the prototype...
								meta.Model.ApplyMixin(meta.Class.prototype, subSpec);
							}
						});
					}
					else {
						// Apply the spec to the prototype of all other meta elements...
						let elementName = propName.slice(2);
						let metaObject = meta[elementName];
						if (typeof metaObject !== 'undefined') {
							castArray(spec[propName]).forEach(function (subSpec) {
								meta.Model.ApplyMixin(metaObject.prototype, subSpec);
							});
						}
						else {
							throw new Error('Unknown meta element in mixin specification: ' + elementName);
						}
					}
				}
				else {
					throw new Error('Invalid property name for mixin specification: ' + propName);
				}
			}
		}
	};

	
	
})(MetaModel);

module.exports = MetaModel;


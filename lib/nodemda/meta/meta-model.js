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

var NodeMDA = require("../nodemda-core.js");

var MetaModel = exports;

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
	meta.MetaElement = class {

		constructor(elementName) {
			this.elementName = elementName;
			this.stereotypes = [];
	    	this._comment = null;
	    }
		
		addTag(metaTag) {
			if (this.tags === undefined) {
				this.tags = [];
			}
			this.tags.push(metaTag);
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
		
		get hasTag(tagName) {
			return (typeof(this.getTagValue(tagName)) !== "undefined");
		}
		
		get comment() {
			return this._comment;
		}
		
		get hasComment() {
			return this._comment !== null;
		}

		addStereotype(stereotype) {
			this.stereotypes.push(stereotype);
		}
		
	};
	
	
	/**
	 * Package is the container or namespace objects belong to
	 */
	meta.Package = class extends meta.MetaElement { 
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
		
	};
	

	/**
	 * Data types available to the mda engine
	 */
	meta.Datatype = class extends meta.MetaElement { 
		constructor(name, options) {
			super("Datatype");
			this._name = name;
			this._options = options;
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
	    	return (this.type.name === "Object");
		}
		
	};
	
	
	meta.ObjectDatatype = class extends meta.Datatype {

		constructor(packageName, className) {
			super("Object");
			this._className = className;
			this._packageName = packageName;
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
	    get metaClass () {
	    	var metaClass = meta.Model.findClass(this.packageName, this.className);
	    	return metaClass;
	    }
	};

	
	meta.Datatype.VoidType = new meta.Datatype("Void");
	

	/**
	 * Stereotypes available to the mda engine
	 */
    meta.Stereotype = class extends meta.MetaElement {

    	constructor(name, options) {
			super("Stereotype");
    		this._name = name;
    		this._options = options;
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
    meta.AbstractVariable = class extends meta.MetaElement {
    	constructor(classTypeName, name, type) {
    		super(classTypeName);
			this._name = name;
			this._type = type;
			this._readOnly = false;
			this._multiplicity = "0..1";
			this._visibility = "public";
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
			return this._type.getName();
		}

		get isPublic() {
			return this._visibility === "public";
		}
		
		/**
		 * Is this variable visible to other classes inside the package?
		 */
		get isVisible() {
			return this._visibility !== "private";
		}
		
		get isReadOnly() {
			return this._readOnly;
		}

		get isRequired() {
			return this._multiplicity.charAt(0) === "1";
		}
		
		get isArray() {
			return this._multiplicity.slice(-1) === "*";
		}
		
		get isObject() {
	    	return (this.type.name === "Object");
		}
		
		get hasDefaultValue() {
			return this.getTagValue("default") !== undefined || this.getTagValue("defaultValue") !== undefined;
		}
		
		get defaultValue() {
			return this.getTagValue("default") || this.getTagValue("defaultValue");
		}
		
    };
    

    
	/**
	 * Attributes of classes 
	 */
	meta.Attribute = class extends meta.AbstractVariable {
		constructor(name, type) {
			super("Attribute", name, type);
			this._static = false;
			this._unique = false;
		}
		
		
		get isStatic() {
			return this._static;
		}
		
		get isUnique() {
			return this._unique;
		}
		
	};


	/**
	 * Parameters of operations 
	 */
	meta.Parameter = class extends meta.AbstractVariable { 
		constructor(name, type) {
			super("Parameter", name, type);
		}
	};


	/**
	 * Methods, functions, and other static operations
	 */
	meta.Operation = class extends meta.MetaElement { 
		constructor(name, returnType) {
			super("Operation");
		    this._name = name;
		    this.parameters = [];
		    if (returnType === undefined) {
		       this._returnType = MetaModel.Datatype.VoidType;
		    } 
		    else {
		       this._returnType = returnType;
		    }
			this._visibility = "public";
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
		
		get isPublic() {
			return this._visibility === "public";
		}
		
		
		get isStatic() {
			return this._static;
		}
		
		get hasReturnType() {
			return (typeof(this._returnType) !== "undefined" && this._returnType !== null &&
			        this.name !== "Void");
		}
		
	};
	

	
	/**
	 * When a class is a generalization (i.e. inherits from) another class, it holds
	 * this reference to the base class object.
	 */
	meta.Generalization = class extends meta.MetaElement {
		constructor(baseObjectDatatype) {
			super("Generalization");
			this._baseObjectDatatype = baseObjectDatatype;
		}
	};



	/**
	 * When a class depends on another object, it holds this reference to the
	 * other object.
	 */
	meta.Dependency = class extends meta.MetaElement {
		constructor(otherObjectDatatype) {
			super("Dependency");
			this._otherObjectDatatype = otherObjectDatatype;
		}
	};
	
	
	
	/**
	 * Associations between two objects have an "end" at each endpoint
	 * that describes the details of the relationship.
	 */
    meta.AssociationEnd = class extends meta.MetaElement {
        constructor() {
			super("AssociationEnd");
        	this._name = null;
        	this._type = null;
        	this._multiplicity = "1";
        	this._navigable = true;
        	this._aggregation = false;
        	this._composition = false;
        	this._public = true;
        	this._isReadOnly = false;
        }	

        /**
         * Returns the name of this association end.  If the name is not explicitly
         * defined in the model, one is synthesized from the type name.
         */
        get name() {
        	if (typeof this._name === "string") {
        		return this._name;
        	}
        	else {
        	    // Synthesize a name from the type name...
        		var typeName = this._type.name;
        		return typeName.charAt(0).tolowercase() + typeName.slice(2);
        	}
		}

        get type() {
        	return this._type;
        }
        
    };	
	
    
    /**
     * Assocations between two objects
     */
    meta.Association = class extends meta.MetaElement {
    	constructor(myEnd, otherEnd) {
			super("Association");
    		this.myEnd = myEnd;
    		this.otherEnd = otherEnd;
    	}
    };

    

	/**
	 * Class definitions
	 */
	meta.Class = class extends meta.MetaElement {
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
			this.dependency.push(dependency);
		}
		
		
		addAssociation(association) {
			this.associations.push(association);
		}
		
		
		setPackage(pack) {
			this._package = pack;
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
		
	};

	
	meta.Model = class {

		constructor(projectName, datatypes, stereotypes, classes) {
			this.name = projectName;
			this.datatypes = datatypes;
			this.stereotypes = stereotypes;
			this.classes = classes;
		}
		
	};

	
	/**
	 * Attempts to locate the Meta.Class object that has the specified
	 * package and class name, returning it.  If no such class can be
	 * found in the model, null is returned.
	 */
	meta.Model.findClass = function(packageName, className) {

		var model = NodeMDA.runtime.model;
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
	
	
})(MetaModel);

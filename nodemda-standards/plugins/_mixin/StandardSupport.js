"use strict";

const NodeMDA = require("nodemda");
const pluralize = require('pluralize');
const camelCase = require('../_helpers/camelCase');


/*
 * StandardSupport.js
 * Contains code that applies to most plugins that generate code for NodeMDA.
 */
var StandardSupport = {};

(function() {


    /**
     * In Javascript, associations to other objects are handled as
     * nested object properties.  A "many" association is simply an array
     * of those objects. This function transforms any associations on
     * a class object to be "just another attribute" on the class. 
     * The original attribute list and association list are saved in 
     * jsOriginalAttributes and jsOriginalAssociations in case they 
     * need to be examined.
     */
    function transformAssocsToAttribs(metaClass) {

	    /**
	     * Transforms all of the associations specified in metaClass
	     * into "Attribute" objects, returning them as an array of
	     * NodeMDA.Meta.Attribute objects.
	     */
	    function assocsToArrayAttribs(metaClass) {
	    	let attribs = [];
			let virtuals = [];
	    	metaClass.associations.forEach(function(metaAssoc) {
	    	   let myEnd = metaAssoc.myEnd;
	    	   let otherEnd = metaAssoc.otherEnd; 
	    	   if (otherEnd.isNavigable) {
				   // Build an attribute that represents the "other end" of the association
	    		   let attrib = new NodeMDA.Meta.Attribute(otherEnd.name, otherEnd.type);
	    		   attrib._multiplicity = otherEnd._multiplicity;
	    		   attrib._public = otherEnd._public;
	    		   attrib._comment = otherEnd._comment;

	    		   if (otherEnd.type instanceof NodeMDA.Meta.ObjectDatatype) {

	    		   		let otherClass = otherEnd.type.metaClass;
	    		   		if (otherClass.stereotypeName === 'ValueObject' || otherClass.stereotypeName === 'POJO') {
	    		   			attrib.setSchemaDbProperty('persistence', 'embed');
	    		   		}

						if (otherClass.stereotypeName === 'Entity' &&
							myEnd.isNavigable && myEnd.isOne && otherEnd.isMany) {
							// This is the special case where we can create a virtual attribute
							// by using the database to look up all of the entries instead
							// of having to manually manage an array of objects as a real
							// attribute.
							attrib.setSchemaDbProperty('foreignKeyField', myEnd.name);
							virtuals.push(attrib);
						}
						else {
							if (myEnd.isNavigable && myEnd.isMany && otherEnd.isOne) {
								// This is the opposite end of the special "virtuals" case above.
								// Make sure we do NOT add a UI field for this reverse case
								// to prevent the circular reference.
								attrib._visibility = 'protected';
								attrib.isForeignKey = true;
							}

							// All other cases requires we represent this association an an
							// actual attribute in our class.
							attribs.push(attrib);
						}
	    		   }
	    	    }
	    	});
	    	return { attribs, virtuals };
	    };

	   const {attribs, virtuals} = assocsToArrayAttribs(metaClass);
       let jsAttributeList = metaClass.attributes.concat(attribs);
       metaClass.jsOriginalAttributes = metaClass.attributes;
       metaClass.attributes = jsAttributeList;
       metaClass.jsOriginalAssociations = metaClass.associations;
       metaClass.associations = [];
	   metaClass.virtuals = virtuals;
    };
    



    /**
     * Takes a string and translates it into a valid Javascript identifier.
     */
    StandardSupport.jsPathToIdentifier = function(packagePath) {
    	if (typeof packagePath === "string") {
    		return packagePath.replace(new RegExp("\\" + NodeMDA.Options.packageDelimeter, "g"), ".");
    	}
    	else {
    		return "";
    	}
    };
    

	StandardSupport.initPlatform = function(context) {

		let model = context.model;

		Object.defineProperty(model, 'entities', {
			get: function() { 
				let entityList = [];
				this.classes.forEach(function(metaClass) {
					if (metaClass.stereotypeName === 'Entity') {
						entityList.push(metaClass);
					}
				});
				return entityList;
			}
		});

		model.mixin({

			onAttribute: [ 
			   { get: [
					/**
					 * jsIdentifierName is the name to use as the identifier name
					 * for an attribute in a class when generating Javascript code. 
					 * The convention used is that read only and private variables are prefixed
					 * with the "_" character.
					 */
					function jsIdentifierName() {
						// if (this.isReadOnly || !this.isPublic) {
						// 	return "_" + this.name;
						// }
						// else {
						// 	return this.name;
						// }
						return this.name;
   					},

 				    function singularName() {
						return pluralize(this.name, 1);
					},

   					function schemaDbProperties() {

   						if (this.isObject) {
   							let metaClass = this.type.metaClass;
		    		   		if (metaClass.stereotypeName === 'ValueObject' || metaClass.stereotypeName === 'POJO') {
		    		   			this.setSchemaDbProperty('persistence', 'embed');
		    		   		}
	    		   		}


	    		   		if (this.isUnique) {
	    		   			this.setSchemaDbProperty('unique', true);
	    		   		}


   						if (this._schemaDbProp) {
   							return JSON.stringify(this._schemaDbProp);
   						}
   					},


                    function isEntity() {
						if (this.isObject) {
							let metaClass = this.type.metaClass;
							return metaClass.isEntity;
						}

						return false;
					},

					function hasIndex() {
						return this.getTagValue('dbIndex');
					},


   					/**
   					* Returns TRUE if this attribute is an object attribute that can and should be 
   					* imported and referenced directly by the schema.
   					*/
   					function importedBySchema() {

						if (this.isObject) {
							if (_.get(this, '_schemaDbProp.persistence') === 'embed' || 
								_.get(this, '_schemaDbProp.foreignKeyField')) {
									return true;
						    }
						}

						return false;
   					}


				]},
			     
			    { func: [
			    	function setSchemaDbProperty(name, value) {
			    		if (!this.hasOwnProperty('_schemaDbProp')) {
			    			this._schemaDbProp = {};
			    		}

			    		this._schemaDbProp[name] = value;
			    	},
			    ]},
			],


			onObjectDatatype: {
				get: [
				    /**
				     * Translates the metamodel's path delimeter into a Javascript appropriate
				     * identifier.
				     */
				    function jsClassNameWithPath() {
	    	   			return StandardSupport.jsPathToIdentifier(this.classNameWithPath);
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
	    	   			return StandardSupport.jsPathToIdentifier(this.classNameWithPath);
					},
					

				    /**
				     * Translates the metamodel's package name to a valid Javascript identifier.
				     */
					function jsPackageName() {
	    	   			return StandardSupport.jsPathToIdentifier(this.packageName);
					},

					function pluralName() {
						return pluralize(this.name);
					},


					/**
					 * Returns a relative path to prefix import statements that allows
					 * any entry that is using the package path as part of its complete
					 * path to get back up to the parent.  For example, a class with
					 * no package can get to its parent with "..".  A class that is two
					 * levels deep can get to the parent with "../../.."
					 */
                    function relativeParentPrefix() {
						if (this.isRootPackage || this.packageDirName.length == 0) {
							return "..";
						}
						else {
						   const slashCount = (this.packageDirName.match(/\//g) || []).length;
						   return '..' +'/..'.repeat(slashCount+1); // Generate the relative prefix
						}
					},


					/**
					 * A path that includes the package name (if there is one).
					 * The string is formatted so {{packagedirPath}}{{class.name}}.js
					 * will resolve to something correctly without double slashes.
					 */
					function packageDirPath() {
						if (this.inRootPackage) {
							return "";
						}
						else {
							return `${this.packageDirName}/`;
						}
					},


					/**
					* Returns TRUE if there are any dependencies on this class to one or more
					* actors.
					*/
					function isRoleRestricted() {
						return this.roleList.length > 0;
					},


					/**
					 * Returns an array of roles this class is dependent on.  Note
					 * that role dependencies are inherited from parent classes
					 */
					function roleList() {
						if (this.hasOwnProperty('__roleList')) {
							return this.__roleList;
						}

						let roles = [];
						if (this.isSubClass) {
							roles = this.parentClass.roleList;
						}

						this.dependentActors.forEach(function (actor) {
							let roleName = actor.name;
							if (roleName.endsWith('Role')) {
								roleName = camelCase(roleName.slice(0, -4));
							}
							roles.push(roleName);
						});

						this.__roleList = roles;

						return roles;
					},


					/**
					* Returns the stringified version of the roles use.  It will be in the
					* format [ 'role1', 'role2',...]
					*/
					function stringifyRoleList() {
						let strList = JSON.stringify(this.roleList);
						return strList.replace(/"/g, '\'');
					},


					function isEntity() {
						return this.stereotypeName === 'Entity';
					},

					function isEnumeration() {
						return this.stereotypeName === 'Enumeration' ||
							   this.stereotypeName === 'enumeration';
					},

					function readPermissions() {
						return JSON.stringify(this.permissions.read);
					},

					function writePermissions() {
						return JSON.stringify(this.permissions.write);
					},

					function deletePermissions() {
						return JSON.stringify(this.permissions.delete);
					},

					function ownPermission() {
						return JSON.stringify(this.permissions.own);
					},

					function isUserOwned() {
						return this.permissions.own != 'admin';
					},

					// TRUE if the CRUD UI code should be generated
					function genCRUD() {
						return this.genREST && !this.getTagValue('noUI');
					},

					// TRUE if REST API code should be generated
					function genREST() {
						return !this.isPrivate && !this.getTagValue('noREST');
					}

				],

				func: [
					function addPermission(perm, roleName) {
						if (!this.permissions) {
							this.permissions = {};
						}

						if (perm === 'own') {
							this.permissions.own = roleName;
						}
						else {
						   if (!this.permissions[perm].includes(roleName)) {
								this.permissions[perm].push(roleName);
						   }
						}
					}
				],

			},

			onDependency: {

				get: [
					function isActor() {
						return (this.otherObject instanceof NodeMDA.Meta.Actor);
					},

					function permissions() {
						let strPerm = this.getTagValue('permissions');
						if (strPerm) {
							// Parse the explicit permissions
							let wordsArray = strPerm.split(/[ ,.\-\/;:]+/);
							let perms = [];
							wordsArray.forEach(function (word) {
								let lcLetter = word.charAt(0).toLowerCase();
								let perm = null;
								switch (lcLetter) {
									case 'o':
										perm = 'own';
										break;

									case 'r':
										perm = 'read';
										break;

									case 'w':
										perm = 'write';
										break;
									case 'd':
										perm = 'delete';
										break;
								}								
  							    if (perm && !perms.includes(perm)) {
									perms.push(perm);
								}
							});
							return perms;

						}
						else {
							// Return the default permissions
							return ['read', 'write', 'delete'];
						}
					},
				]
			},

			onActor: {
				get: [
					function roleName() {
						if (this.name.endsWith('Role')) {
							return camelCase(this.name.slice(0, -4));
						}
						else {
							return camelCase(this.name);
						}				
					},

				]
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


        // All code from this point on will be executed once just before NodeMDA starts
		// processing classes in the model. This is where we put any special transformations
		// or model additions that are needed for the NodeMDA templates to work.


		// Transform the associations on all of the classes to simple object properties...
		model.classes.forEach(function (metaClass) {
			transformAssocsToAttribs(metaClass);
		});


        // Gather all of the roles defined in the model...
		model.defineEnumerationType('SystemRole', []);
		model.actors.forEach(function (actor) {
			model.Types.SystemRole.addOption(actor.roleName);
		});


		// Set default permissions for all classes
		model.classes.forEach(function (metaClass) {
			// Gather all dependencies that are to Actors
			let actorDeps = metaClass.dependencies.filter(function (dep) {
				return dep.isActor;
			});

			// Set default permissions
			metaClass.permissions = {
				own: 'admin',
				read: ['admin'],
				write: ['admin'],
				delete: ['admin']
			}

			if (actorDeps.length > 0) {
				// We have explicit actor dependencies
				actorDeps.forEach(function (dep) {
					let permissions = dep.permissions;
					permissions.forEach(function (perm) {
						let roleName = dep.otherObject.roleName;
						metaClass.addPermission(perm, roleName);
						if (perm === 'own' && roleName !== 'admin') {
							metaClass.addPermission('read', 'owner');
							metaClass.addPermission('write', 'owner');
							metaClass.addPermission('delete', 'owner');
						}
					});
				});
			}
			else {
				// Use default permissions for this class
				if (metaClass.isPublic) {
					metaClass.addPermission('read', 'guest');
					metaClass.addPermission('write', 'guest');
					metaClass.addPermission('delete', 'guest');
				}
				else if (metaClass.isProtected) {
					metaClass.addPermission('read', 'user');
					metaClass.addPermission('write', 'user');
					metaClass.addPermission('delete', 'user');
				}
			}
		});

		// Turn all of the classes marked with the Enumeration stereotype into enumerations...
		model.classes.forEach(function (metaClass) {
			if (metaClass.isEnumeration) {
				model.defineEnumerationType(metaClass.name, []);

				// Now turn each attribute into an option in the enumeration...
				let enumType = model.Types[metaClass.name];
				metaClass.attributes.forEach(function (attrib) {
					enumType.addOption(attrib.name);
				});
			}
		});


		// Finally, find every class that is marked with the "Entity" stereotype and
        // change any attrributes that reference the enumeration class into the
		// enumeration data type.
		model.classes.forEach(function (metaClass) {
			if (metaClass.stereotypeName === 'Entity') {
				metaClass.attributes.forEach(function (attrib) {
					if (attrib.isObject) {
						let attribClass = attrib.type.metaClass;
						if (attribClass && attribClass.isEnumeration) {
							attrib._type = model.Types[attribClass.name];
						}
					}
				});
			}
		});


/*
        // Dump out the entire meta model for plugin development and debugging purposes...
        model.classes.forEach(function (metaClass) {
			if (metaClass.stereotypeName === 'Entity') {
				console.log(`Entity name: ${metaClass.name}`);
				console.log(JSON.stringify(metaClass,null,6));
			}
		});
*/

		// Dump out the classes...
		// Uncomment the code block below to get a dump of the meta model
		/**
		console.log("Class meta model:");
		model.classes.forEach(function (metaClass) {
			console.log(`\nClass: ${metaClass.name} <<${metaClass.stereotypeName}>>`);
			metaClass.attributes.forEach(function (attrib) {
				console.log(`    Attrib: ${JSON.stringify(attrib,null,6)}`);
			});
		});
		*/
	};

	
})();

module.exports = StandardSupport;

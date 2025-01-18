"use strict";

const NodeMDA = require("nodemda");
const winston = require("winston");

const StereotypeDefs = {
    "Entity": "Marks a class that represents a record in a database table or a Document in a collection.",

    "POJO": "Marks a class that represents a software class for holding data. If used as the data type of an " +
            "Entity's attribute, then that attribute is a sub document embedded directly in the Entity.",

    "Service": "Marks a class as an interface for a remote procedure calls. Each operation in the class is " +
                "a remote procedure that can be executed by the remote interface",

    "Enumeration": "Defines a simple enumeration data type. Each attribute is actually one possible value of the enumeration.",
};

var LLMAppWriterSupport = {};

var referencedStereotypeNames = new Set();

(function() {


    LLMAppWriterSupport.validateModel = function(metaModel, validationStatus) {
        // Check each entity and see if a permission dependency exists
        // (i.e. there is a dependency to an Actor)
        metaModel.classes.forEach(function(metaClass) {
            if (metaClass.stereotypeName === "Entity") {
                let hasPermissionDependency = false;
                metaClass.dependencies.forEach(function(dep) {
                    if (dep.otherObject instanceof NodeMDA.Meta.Actor) {
                        hasPermissionDependency = true;
                    }
                });
                if (!hasPermissionDependency) {
                    if (metaClass.isPublic) {
                        winston.warn("WARNING: Entity " + metaClass.name + " has public visibility with no explicit permission dependency. It is accessible to guest user.");
                        validationStatus.warnCount++;
                    }
                }
            }
        });                            

        return true;
    };

    /**
     * Called once after all partials and helpers have been loaded
     * and just before any classes are processed.
     * 
     * @param {HandlebarsContext} context
     */
    LLMAppWriterSupport.initPlatform = function(context) {
        let model = context.model;

        model.mixin({
    
          onStereotype: {
            get: [
                    function purpose() {
                        return StereotypeDefs[this.name];
                    },
            ],
          },
    
        }); // end mixin
    
        // Find all of the stereotypes actually referenced in the model and attached
        // to classes and save them in the context
        context.referencedStereotypes = []
        model.classes.forEach(function(metaClass) {
            metaClass.stereotypes.forEach(function(stereotype) {
                if (!referencedStereotypeNames.has(stereotype.name)) {
                    context.referencedStereotypes.push(stereotype);
                    referencedStereotypeNames.add(stereotype.name);
                }
            });
        });

        // Determine if any of the entities in the model are owned by a role
        // other than "admin"
        context.hasUserOwnedEntities = false;
        model.classes.forEach(function(metaClass) {
            if (metaClass.stereotypeName === "Entity" && metaClass.permissions.own !== "admin") {
                context.hasUserOwnedEntities = true;
            }
        });

    };

})();

module.exports =  LLMAppWriterSupport;
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

var metaModel = require('../meta/meta-model.js');
var winston = require('winston');

/**
 * Adds a "validate" function to the meta model. This can be called to check and make
 * sure the meta model is not missing any critical parts.
 */
(function(meta){
	
	meta.validate = function(metaModel, validationStatus) {

		var msg;
		
		var logWarn = function(typeName, metaObj, msg) {
			msg = "WARN: " + typeName + " " + metaObj._name + msg;
			winston.warn(msg);
			validationStatus.warnCount++;
		};

		
		var logError = function(typeName, metaObj, msg) {
			msg = "ERROR: " + typeName + " " + metaObj._name + msg;
			winston.error(msg);
			validationStatus.errorCount++;
		};
		
		
		var isMissing = function(obj) {
			return (obj === undefined || obj === null ||
					(typeof(obj) === "string" && obj.length === 0)); 
		};

		
		metaModel.classes.forEach(function(metaClass) {
			
			if (metaClass.stereotypes.length === 0) {
				logWarn("Class", metaClass, " has no stereotypes. No class code will be generated.");
			}
			
			metaClass.attributes.forEach(function(metaAttribute) {
			   if (isMissing(metaAttribute._type)) {
				   logError("Attribute", metaAttribute, " on class " + metaClass._name + " has no data type defined.");
			   }	
			});
			
			
			metaClass.operations.forEach(function(metaOperation) {
			    metaOperation.parameters.forEach(function (metaParameter) {
			        if (isMissing(metaParameter._type)) {
			        	logError("Paramter", metaParameter, 
			        			" in operation " + metaOperation._name + 
			        			" of class " + metaClass._name + 
			        			" has no data type");
			        }
			    });	
			});
			
			
		});

	
		return (validationStatus.errorCount === 0);
		
	};
	
})(metaModel);

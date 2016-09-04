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

(function(meta){

	var warnCount = 0;
	var errorCount = 0;
	
	meta.validate = function(metaModel) {

		warnCount = 0;
		errorCount = 0;
		var msg;
		
		winston.info("Validating model...");
	
		
		var logWarn = function(typeName, metaObj, msg) {
			msg = "WARN: " + typeName + " " + metaObj._name + msg;
			winston.warn(msg);
			warnCount++;
		};

		
		var logError = function(typeName, metaObj, msg) {
			msg = "ERROR: " + typeName + " " + metaObj._name + msg;
			winston.error(msg);
			errorCount++;
		};
		
		
		var isMissing = function(obj) {
			return (obj === undefined || obj === null ||
					(typeof(obj) === "string" && obj.length === 0)); 
		};

		
		metaModel.classes.forEach(function(metaClass) {
		
			if (metaClass.getPackageName().length === 0) {
				logWarn("Class", metaClass, " has no package specified. Code will be in root of project.");
			}
			
			
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

		var logLevel;
		if (errorCount > 0) {
			logLevel = "error";
		}
		else if (warnCount > 0) {
			logLevel = "warn";
		}
		else {
			logLevel = "info";
		}
		
		winston.log(logLevel, "Validation completed: " + errorCount + " errors, " + warnCount + " warnings");
		
		return (errorCount === 0);
		
	};
	
})(metaModel);

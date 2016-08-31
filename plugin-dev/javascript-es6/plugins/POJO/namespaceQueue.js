"use strict";

var NodeMDA = require("nodemda");

var NamespaceQueue = NamespaceQueue || {};

/**
 * The Namespace Queue queues up a list of class file names that are processed with
 * this plugin so they can be included in the master Namespace file later.
 */
(function() {

	/**
	 * Called by the code generator before each Pojo class is processed, this
	 * function will save the package name and class for later processing...
	 */
	NamespaceQueue.initClass = function(context, metaClass) {
		
		// First, see if we need to create a Namespace queue object in the first place...
		if (typeof(context._jsNamespaceQueue) === "undefined") {

			context._jsNamespaceQueue = { classMap: {} };
		
			// Define some helper functions for use by the project's namespace.js.hbs template...
			
			/**
			 *  Return a list of all of the packages that have been visited by the Namespace system...
			 */
			context._jsNamespaceQueue.packageNames = function() {
			    var pkgList = [];
			    for (var pkgName in context._jsNamespaceQueue.classMap) {
			    	pkgList.push(pkgName);
			    }
			    pkgList.sort();
			    return pkgList;
			};

			/**
			 * Return all of the classes that are in the specified package...
			 */
			context._jsNamespaceQueue.packageClassList = function(pkgName) {
				var classList = context._jsNamespaceQueue.classMap[pkgName];
				return classList;
			};
		}

		
		// If the class we are currently visiting is in a package, queue
		// it up for namespace processing...
		var pkgName = metaClass.packageName;
		if (pkgName.length > 0) {
			pkgName = pkgName.replace(new RegExp("\\" + NodeMDA.Options.packageDelimeter, "g"), ".");
			var classList = context._jsNamespaceQueue.classMap[pkgName];
			if (classList === undefined) {
				classList = [];
			}
			
			// Save a reference to this class for later processing...
			classList.push(metaClass);
			context._jsNamespaceQueue.classMap[pkgName] = classList;
		}
		
	};
	
})();

module.exports = NamespaceQueue;
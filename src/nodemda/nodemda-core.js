
var path = require('path');

var NodeMDA = exports;

NodeMDA.Options = NodeMDA.Options || {};

NodeMDA.Options.plugins = null;

NodeMDA.Options.platform = "nodejs";

NodeMDA.Options.output = "./output";

NodeMDA.Options.packageDelimeter = ":";

(function() {

    var nodeModDir;
    var nodemdaDir;

    
NodeMDA.getPlatform = function() {
	return NodeMDA.Options.platform;
};



NodeMDA.getNodeMDADir = function() {

	if (typeof nodemdaDir === "undefined") {
		var hModDir = require.resolve('nodemda');
		nodemdaDir = path.dirname(require.resolve('nodemda'));
	}
	
	return nodemdaDir;
};



NodeMDA.getModuleDir = function(moduleName) {

	var prefix;
	if (NodeMDA.Options.plugins !== null) {
	    prefix = NodeMDA.Options.plugins;
	}
	else {
		if (typeof(nodeModDir) === "undefined") {
			var hModDir = require.resolve('handlebars');
			var ndx = hModDir.indexOf("node_modules");
			nodeModDir = hModDir.substr(0, ndx+"node_modules".length);
		}
		prefix = nodeModDir;
	}
	
    return prefix + "/" + "nodemda-" + moduleName + "/plugins";
	
};



NodeMDA.getPlatformDir = function() {
	return NodeMDA.getModuleDir(NodeMDA.getPlatform());
};


})();


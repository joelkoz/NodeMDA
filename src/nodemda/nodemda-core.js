
const path = require('path');
const fs = require('fs');

let NodeMDA = {};

NodeMDA.Options = NodeMDA.Options || {};

NodeMDA.Options.plugins = null;

NodeMDA.Options.platform = "javascript-es6";

NodeMDA.Options.output = "./src";

NodeMDA.Options.packageDelimeter = ":";

let nodemdaDir;
let platformDir;

NodeMDA.getPlatform = function() {
	return NodeMDA.Options.platform;
};



NodeMDA.getNodeMDADir = function() {

	if (typeof nodemdaDir === "undefined") {
		let hModDir = require.resolve('nodemda');
		nodemdaDir = path.dirname(require.resolve('nodemda'));
	}
	
	return nodemdaDir;
};



NodeMDA.getPlatformDir = function() {

	if (typeof(platformDir) === 'undefined') {

		let pluginName = 'nodemda-' + NodeMDA.getPlatform();

		// First, see if we have a 'node_modules' dir in the cwd...
		let pluginPath = process.cwd() + '/node_modules/' + pluginName;
		if (!fs.existsSync(pluginPath)) {
			// Its not there. Now try to resolve it using the normal
			// search algorithm.
		    pluginPath = require.resolve(pluginName);
		}
		platformDir = pluginPath + '/plugins';
	}

	return platformDir;
};


module.exports = NodeMDA;

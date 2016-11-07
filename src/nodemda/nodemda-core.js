
const path = require('path');
const fsx = require('fs-extra');

let NodeMDA = {};

NodeMDA.Options = NodeMDA.Options || {};

NodeMDA.Options.platform = "javascript-es6";

NodeMDA.Options.output = "./src";

NodeMDA.Options.forceOverwrite = false;

NodeMDA.Options.readerName = 'nodemda-staruml';

NodeMDA.Options.packageDelimeter = ":";

NodeMDA.Options.modelFileName = null;


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
		if (!fsx.existsSync(pluginPath)) {
			// Its not there. Now try to resolve it using the normal
			// search algorithm.
		    pluginPath = path.dirname(require.resolve(pluginName));
		}
		platformDir = pluginPath + '/plugins';
	}

	return platformDir;
};

const OPTION_PACKAGE = './nodemda.json';

// Writes the current options out to nodemda.json in the cwd..
NodeMDA.writeOptions = function() {
	fsx.writeJson(OPTION_PACKAGE, NodeMDA.Options);
}


// Loads the current options out of nodemda.json in the cwd, IF
// it exists.
NodeMDA.loadOptions = function() {
	if (fsx.existsSync(OPTION_PACKAGE)) {
		let options = fsx.readJsonSync(OPTION_PACKAGE, { throws: false });
		Object.assign(NodeMDA.Options, options);
	}
}

module.exports = NodeMDA;

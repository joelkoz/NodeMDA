
var NodeMDA = exports;

NodeMDA.Options = NodeMDA.Options || {};

NodeMDA.Options.plugins = "./plugins";

NodeMDA.Options.platform = "nodejs";

NodeMDA.Options.output = "./output";

NodeMDA.Options.packageDelimeter = ":";




NodeMDA.getPlatform = function() {
	return NodeMDA.Options.platform;
};


NodeMDA.getPlatformDir = function() {
	return NodeMDA.Options.plugins + "/" + NodeMDA.getPlatform();
};

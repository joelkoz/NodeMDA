const reader = require('./nodeuml-reader.js');

module.exports = {
	type: 'reader',
	name: 'nodeuml',
	desc: 'Reads UML models from NodeUML',
	version: 2.0,
	reader: reader
};

const reader = require('./staruml-reader.js');

module.exports = {
	type: 'reader',
	name: 'staruml',
	desc: 'Reads UML models from Star UML 2',
	version: 2.0,
	reader: reader
};

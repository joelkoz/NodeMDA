
const NodeMDA = require('./nodemda-core.js');
NodeMDA.Meta = require("./meta/meta-model.js");
require('./meta/meta-validator.js');
require('./gen/code-generator.js');

module.exports = NodeMDA;

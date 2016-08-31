
var NodeMDA = require('./nodemda/nodemda-core.js');
NodeMDA.Meta = require("./nodemda/meta/meta-model.js");
require('./nodemda/meta/meta-validator.js');
require('./nodemda/gen/code-generator.js');

module.exports = NodeMDA;

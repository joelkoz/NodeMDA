"use strict";

var pluralize = require("pluralize");

var pluralOf = function(str) {
    return pluralize(str);
};

module.exports = pluralOf;

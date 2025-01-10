"use strict";

var pluralize = require("pluralize");

var singularOf = function(str) {
    return pluralize(str, 1);
};

module.exports = singularOf;

"use strict";

var Handlebars = require("handlebars");

var defaultTo = function(value1, value2) {
    return value1 || value2;
};

module.exports = defaultTo;

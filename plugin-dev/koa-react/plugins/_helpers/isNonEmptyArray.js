"use strict";

var isNonEmptyArray = function(arr) {
    return Array.isArray(arr) && arr.length > 0;
};

module.exports = isNonEmptyArray;
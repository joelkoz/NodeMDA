"use strict";

var ifBoth = function(condition1, condition2, options) {
    if (condition1 && condition2) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
};

module.exports = ifBoth;

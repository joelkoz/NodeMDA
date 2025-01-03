"use strict";

var fnEval = function(fn, ...args) {
   args.pop(); // Remove the last argument, which is the Handlebars options object
   if (typeof fn === 'function') {
     return fn(...args);
   }
   return '';
};

module.exports = fnEval;

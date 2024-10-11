"use strict";

var concat = function(...args) {
  // Remove the last argument (options object provided by Handlebars)
  args.pop();
  return args.join('');
};

module.exports = concat;

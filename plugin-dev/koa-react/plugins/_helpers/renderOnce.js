"use strict";

var renderOnce = function(objectToProtect, options) {
   
    // Retrieve the visited set from options, or create it if not provided
    const visited = options.data.visited || new WeakSet();

    // Check if the current object has already been visited
    if (visited.has(objectToProtect)) {
        // circular reference
        return "";
    }

    // Mark this object as visited
    visited.add(objectToProtect);

    // Clone options.data and pass the updated visited set
    const newData = Object.assign({}, options.data, { visited });

    // Render the block with the updated data
    return options.fn(this, { data: newData });
};

module.exports = renderOnce;

export default function assignPath(obj, path, value) {
    const keys = path.split('.');  // Split the path into an array of keys
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
            current[keys[i]] = {};  // Create an empty object if it doesn't exist
        }
        current = current[keys[i]];  // Move one level deeper
    }

    current[keys[keys.length - 1]] = value;  // Assign the value to the final key

    return obj;
}


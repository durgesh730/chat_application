/**
 * Create an object composed of the picked object properties
 * @param {Object} object
 * @param {String} keys
 * @returns {Object} Returns the new object
 */
const pick = (object, keys) => {
    return keys.reduce((obj, key) => {
        if (object && Object.prototype.hasOwnProperty.call(object, key)) {
            // eslint-disable-next-line no-param-reassign
            obj[key] = object[key];
        }
        return obj;
    }, {});
};

module.exports = pick;
"use strict";
/** @format */
function WrappedObject(key, value, isArray) {
    if (isArray)
        key += 's';
    this.key = value;
    return this;
}
module.exports = WrappedObject;

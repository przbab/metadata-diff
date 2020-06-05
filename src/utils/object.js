'use strict';

const { curry, compose, or } = require('./functional');

const get = curry((pathString, sourceObj) =>
    (pathString || '').split('.').reduce((subObj, subPath) => (subObj ? subObj[subPath] : undefined), sourceObj)
);

const getOr = curry((defaultValue, pathString, sourceObj) => compose(or(defaultValue), get(pathString))(sourceObj));

module.exports = {
    get,
    getOr,
};

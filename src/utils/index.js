'use strict';

const functional = require('./functional');
const object = require('./object');
const string = require('./string');

module.exports = {
    ...functional,
    ...object,
    ...string,
};

'use strict';

const curryN = (length, fn) =>
    function applyArgs(...args) {
        return args.length < length ? (...newArgs) => applyArgs(...args, ...newArgs) : fn(...args);
    };

const curry = fn => curryN(fn.length, fn);

const or = curry((defaultValue, value) => (value !== undefined ? value : defaultValue));

const compose = (...fns) => input => fns.reduceRight((result, fn) => fn(result), input);

const pipe = (...fns) => input => fns.reduce((result, fn) => fn(result), input);

module.exports = {
    compose,
    curry,
    curryN,
    or,
    pipe,
};

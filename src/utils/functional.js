export const curryN = (length, fn) =>
    function applyArgs(...args) {
        return args.length < length ? (...newArgs) => applyArgs(...args, ...newArgs) : fn(...args);
    };

export const curry = (fn) => curryN(fn.length, fn);

export const or = curry((defaultValue, value) => (value !== undefined ? value : defaultValue));

export const compose =
    (...fns) =>
    (input) =>
        fns.reduceRight((result, fn) => fn(result), input);

export const pipe =
    (...fns) =>
    (input) =>
        fns.reduce((result, fn) => fn(result), input);

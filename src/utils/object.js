import { compose, curry, or } from './functional.js';

export const get = curry((pathString, sourceObj) =>
    (pathString || '').split('.').reduce((subObj, subPath) => (subObj ? subObj[subPath] : undefined), sourceObj)
);

export const getOr = curry((defaultValue, pathString, sourceObj) =>
    compose(or(defaultValue), get(pathString))(sourceObj)
);

import * as functional from './functional.js';
import * as object from './object.js';
import * as string from './string.js';

export * from './functional.js';
export * from './object.js';
export * from './string.js';

const combined = { ...functional, ...object, ...string };

export default combined;

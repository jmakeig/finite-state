/**
 * Shallow clone of an object, assigning additional properties.
 *
 * @param {Object} [obj] Any objects
 * @param {Object[]} [props] Additional properties to assign
 * @return {Object} New cloned instance
 */
export function shallowClone(obj = Object.create(null), ...props) {
  if (null === obj) return null;
  return Object.assign(
    obj.constructor ? new obj.constructor() : Object.create(null),
    obj,
    ...props
  );
}

/**
 * Shallow clone of an object *excluding* the named enumerable properties.
 *
 * @param {Object} obj Any object
 * @param {String[]} props Zero or more property names
 * @return {Object} New cloned instance
 */
export function without(obj, ...props) {
  const tmp = shallowClone(obj);
  for (const prop of props) {
    delete tmp[prop];
  }
  return tmp;
}

/**
 * Call a method of `that` if it exists. This is useful for the
 * case where there’s a `cancel` activity that hasn’t been implemented.
 *
 * @param {Function} fn A method (i.e. function property) that can be bound to `that`
 * @param {Object} that The instance to bind `fn` to
 * @param {Boolean} [strict = false] Whether to strictly check the existence of the method. Helpful for debugging.
 * @return Whatever the function returns or `undefined` if the method doesn’t exist
 *
 */
export function call(fn, that, strict = false) {
  if (fn && 'function' === typeof fn) {
    return fn.call(that);
  }
  if (strict) {
    throw new ReferenceError(`Must reference a valid instance method`);
  }
}

/**
 * Capitalize the first letter of a string.
 *
 * @param {String|*} str
 * @return The capitalized string or itself for non-strings
 */
export function capitalize(str) {
  if ('string' === typeof str && str.length > 1) {
    return str.charAt(0).toUpperCase() + str.substr(1, str.length);
  }
  return str;
}

// FIXME: What about error handling?
function promisify(fn, ...rest) {
  if ('function' !== typeof fn) throw new TypeError(typeof fn);
  const result = fn(...rest);
  if (result instanceof Promise) return result;
  return Promise.resolve(result);
}

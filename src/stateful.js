import { Machine } from 'xstate';
import { createStore } from 'redux';

/**
 * Create a new application state machine.
 *
 * @param {Object} machine Finite state machine definition
 * @param {Function} reducer Takes an action and returns a state
 * @param {Object} [start] Optionally set the state, for example, for testing.
 *                    `currentState` and `state` properties to initialize.
 */
function Stateful(machine, reducer = (s, a) => s, start) {
  const xstate = Machine(
    Object.assign(
      {},
      machine,
      // Override the `initial` property of state machine configuration
      start && start.currentState ? { initial: start.currentState } : {}
    )
  );
  this._machine = xstate;
  this.currentState = this._machine.initialState;

  this._store = createStore(reducer, start ? start.state || {} : {});
  this._store.subscribe(() => {
    this.dispatch(this._store.getState());
  });

  Object.defineProperties(this, {
    state: {
      enumerable: true,
      get: () => this._store.getState()
    }
  });
}

Stateful.prototype.transition = function(event, action) {
  const curr = (this.currentState = this._machine.transition(
    this.currentState,
    event
  ));
  // Synchronously update the appstate
  // if (action) {
  // console.log(`Updating state for ${event}`, action);
  this._store.dispatch({ type: event, payload: action });
  // }
  if (curr.actions && curr.actions.length > 0) {
    return Promise.all(
      // Assumes that all actions are asynchronous and return a `Promise`
      // TODO: Is that a good assumption? I think actions are supposed to be
      //       synchronous and activities async. But maybe that’s what
      //       `Promise.all()` ensures with the ordering.
      //       See `promisify()` above.
      curr.actions.map(a => call(this[normalizeAction(a)], this))
    );
  }
  return Promise.resolve();
};

Stateful.prototype.dispatch = function(state) {
  console.log('Dispatching app state update…');
};

function normalizeAction(action) {
  const STOP = 'cancel';
  if ('undefined' === typeof action || null === action) {
    throw new ReferenceError('An action must exist');
  }
  if ('string' === typeof action) return action;
  if ('xstate.start' === action.type) return action.activity;
  if ('xstate.stop' === action.type) {
    return STOP + capitalize(action.activity);
  }
  throw new Error(action);
}

/**
 * Call a method of `that` if it exists. This is useful for the
 * case where there’s a `cancel` activity that hasn’t been implemented.
 *
 * @param {Function} fn A method (i.e. function property) that can be bound to `that`
 * @param {Object} that The instance to bind `fn` to
 * @return Whatever the function returns or `undefined` if the method doesn’t exist
 *
 * @see normalizeAction
 */
function call(fn, that) {
  if (fn && 'function' === typeof fn) {
    return fn.call(that);
  }
}

/**
 * Capitalize the first letter of a string.
 *
 * @param {String|*} str
 * @return The capitalized string or itself for non-strings
 */
function capitalize(str) {
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

export default Stateful;

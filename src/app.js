import { Machine } from 'xstate';
import { createStore } from 'redux';
import markdown from '../src/states/machine.js';

/**
 * Create a new application state machine.
 *
 * @param {*} [start] Optionally set the state, for example, for testing.
 *                    `currentState` and `state` properties to initialize.
 */
function App(start) {
  const machine = Machine(
    Object.assign(
      {},
      markdown,
      // Override the `initial` property
      start && start.currentState ? { initial: start.currentState } : {}
    )
  );
  this._machine = machine;
  this.currentState = machine.initialState;

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

  function reducer(state, action) {
    // `action.type` comes from the state transition name
    switch (action.type) {
      case 'success':
      case 'error':
        return Object.assign({}, state, { file: action.payload });
      case 'selectText':
        return Object.assign({}, state, { selection: action.payload });
    }
    return state;
  }
}

App.prototype.dispatch = function(state) {
  console.log('Dispatching app state update…');
};

App.prototype.transition = function(event, action) {
  const curr = (this.currentState = this._machine.transition(
    this.currentState,
    event
  ));
  // Synchronously update the appstate
  if (action) {
    console.log(`Updating state for ${event}`, action);
    this._store.dispatch({ type: event, payload: action });
  }
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

// FIXME: Dummy async loader
function doLoadMarkdown() {
  // FIXME: How do I fake a delay here with setTimeout?
  // return new Promise(resolve => setTimeout(() => resolve('myFile.md'), 200));
  const payload = {
    name: 'some-file.md',
    markdown: '# Hello, world!\n\nIpsum lorem…',
    annotations: {}
  };
  // TODO: Load and parse Markdown file from the file system
  return Promise.resolve(payload);
}

/**
 * Instance method matches `onEntry` state action
 *
 * @return Promise
 */
App.prototype.loadMarkdown = function() {
  return doLoadMarkdown()
    .then(file => {
      return this.transition('success', file);
    })
    .catch(error => {
      return this.transition('error', error);
    });
};

App.prototype.clearSelection = function() {};

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

// FIXME: What about error handling?
function promisify(fn, ...rest) {
  if ('function' !== typeof fn) throw new TypeError(typeof fn);
  const result = fn(...rest);
  if (result instanceof Promise) return result;
  return Promise.resolve(result);
}

export default App;

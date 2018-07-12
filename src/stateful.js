import { Machine, State } from 'xstate';
import { createStore } from 'redux';
import { call, capitalize } from './util.js';

/**
 * Create a new application state machine.
 *
 * @param {Object} machine Finite state machine definition
 * @param {Function} reducer Takes an action and returns a state
 * @param {Object} [start] Optionally set the state, for example, for testing.
 *                    `currentState` and `state` properties to initialize.
 */
function Stateful(machine, reducer = (s, a) => s, start) {
  const xstate = Machine(machine);
  this._machine = xstate;

  // <https://github.com/davidkpiano/xstate/issues/147#issuecomment-404633488>
  this.currentState =
    start && start.currentState
      ? new State(start.currentState)
      : this._machine.initialState;

  // FIXME: Need to run state actions, espeically when overriding the initial state

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
  // console.log('Dispatching app state update…');
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

export default Stateful;

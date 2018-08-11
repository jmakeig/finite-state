import { Machine, State } from 'xstate';
import { createStore, applyMiddleware } from 'redux';
import { call, capitalize } from './util.js';

/**
 * Create a new application state machine.
 *
 * @param {Object} machine Finite state machine definition
 * @param {Function} reducer Takes an action and returns a state
 * @param {Object} [start] Optionally set the state, for example, for testing.
 *                    ._currentState` and `state` properties to initialize.
 */
function Stateful(machine, reducer = (s, a) => s, start) {
  if (undefined === machine)
    throw new ReferenceError('machine cannot be undefined');
    
  this._machine = Machine(machine);

  // <https://github.com/davidkpiano/xstate/issues/147#issuecomment-404633488>
  this._currentState =
    start && start.state ? new State(start.state) : this._machine.initialState;

  // FIXME: Need to run state actions, espeically when overriding the initial state

  const logger = store => next => action => {
    // console.log('Dispatching', action);
    const result = next(action);
    // console.log('Next state', store.getState());
    return result;
  };

  this._store = createStore(
    reducer,
    start ? start.model || {} : {},
    applyMiddleware(logger)
  );
  this._store.subscribe(() => {
    this.dispatch(this._store.getState());
  });

  Object.defineProperties(this, {
    state: {
      enumerable: true,
      get: () => this._currentState
    },
    model: {
      enumerable: true,
      get: () => this._store.getState()
    }
  });
}

Stateful.prototype.transition = function(event, action) {
  const curr = (this._currentState = this._machine.transition(
    this._currentState,
    event
  ));
  // Synchronously update the appstate
  // console.log(`Updating state for ${event}`, action);
  // Ensure the action types are unique by prefixing the event with the
  // state that transitioned *in*
  const type = `${this._currentState.history.toString()}.${event}`;
  this._store.dispatch({ type, payload: action });
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

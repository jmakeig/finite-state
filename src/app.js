import { Machine } from 'xstate';
import { createStore } from 'redux';
import markdown from '../src/states/machine.js';

// TODO: Add a parameter to seed an itial state
function App() {
  const machine = Machine(markdown);

  this._machine = machine;
  this.currentState = machine.initialState;

  function reducer(state, action) {
    // `action.type` comes from the state transition name
    switch (action.type) {
      case 'success':
      case 'error':
        return Object.assign({}, state, { file: action.payload });
    }
    return state;
  }

  this._store = createStore(reducer, {});
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

App.prototype.dispatch = function(state) {
  //
};
App.prototype.transition = function(event, action) {
  if (!event) {
    throw new ReferenceError('event cannot be empty');
  }

  // console.log(`Transitioning from ${this.currentState.value} using ${event}`);
  const curr = this._machine.transition(this.currentState, event);
  if (action) {
    // console.log(`Updating state with ${action.type}`);
    this._store.dispatch({ type: event, payload: action });
  }
  this.currentState = curr;
  if (curr.actions && curr.actions.length) {
    // console.log(`Executing actions ${curr.actions}`);
    return Promise.all(curr.actions.map(action => this[action]()));
  }
  // FIXME: Updates to state and UI state need to be transactional

  // TODO: This looks weird
  return Promise.resolve();
};

// FIXME: Dummy async loader
function doLoadMarkdown() {
  // QUESTION: How do I fake a delay here with setTimeout?
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

export default App;

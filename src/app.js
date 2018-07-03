import machine from '../src/states/machine.js';
import { createStore } from 'redux';

function App() {
  this._machine = machine;
  this.currentState = machine.initialState;

  function reducer(state, action) {
    switch (action.type) {
      case 'LOAD_MARKDOWN':
      case 'LOAD_MARKDOWN_ERROR':
        return { ...state, ...action.payload };
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
  console.log(`Transitioning from ${this.currentState.value} using ${event}`);
  const curr = this._machine.transition(this.currentState, event);
  if (action && action.type) {
    console.log(`Updating state with ${action.type}`);
    this._store.dispatch(action);
  }
  this.currentState = curr;
  if (curr.actions && curr.actions.length) {
    console.log(`Executing actions ${curr.actions}`);
    return Promise.all(curr.actions.map(action => this[action]()));
  }
  // FIXME: Updates to state and UI state need to be transactional

  // TODO: This looks weird
  return Promise.resolve();
};

// Dummy async loader
function doLoadMarkdown() {
  // QUESTION: How do I fake a delay here with setTimeout?
  // return new Promise(resolve => setTimeout(() => resolve('myFile.md'), 200));
  const payload = {
    name: 'some-file.md',
    markdown: '# Hello, world!\n\nIpsum lorem…'
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
      return this.transition('success', {
        type: 'LOAD_MARKDOWN',
        payload: { file }
      });
    })
    .catch(error => {
      return this.transition('error', {
        type: 'LOAD_MARKDOWN_ERROR',
        payload: { error }
      });
    });
};

export default App;

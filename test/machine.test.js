import machine from '../src/states/machine.js';
import { createStore } from 'redux';

function App(machine) {
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
    this.dispatch(this.store.getState());
  });
}
Object.defineProperties(App.prototype, {
  state: {
    enumerable: true,
    writable: false,
    getter: () => this.store.getState()
  }
});
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
    return Promise.all(curr.actions.map(action => this[action]()));
  }
  // TODO: This looks weird
  return new Promise(resolve => resolve());
};

// Dummy async loader
function doLoadMarkdown() {
  // QUESTION: How do I fake a delay here with setTimeout?
  // return new Promise(resolve => setTimeout(() => resolve('myFile.md'), 200));
  const payload = {
    file: 'some-file.md',
    markdown: '# Hello, world!\n\nIpsum lorem…'
  };
  // TODO: Load and parse Markdown file from the file system
  return new Promise(resolve => resolve(payload));
}

// Instance method matches `onEntry` state action
App.prototype.loadMarkdown = function() {
  return new Promise((resolve, reject) => {
    doLoadMarkdown()
      .then(file => {
        this.transition('success', {
          type: 'LOAD_MARKDOWN',
          payload: { file }
        });
        resolve();
      })
      .catch(error => {
        this.transition('error', {
          type: 'LOAD_MARKDOWN_ERROR',
          payload: { error }
        });
        reject(error);
      });
  });
};

test('load', () => {
  const app = new App(machine);
  app
    .transition('load')
    .then(() => {
      expect(app.currentState.value).toBe('Document');
    })
    .catch(() => {
      throw new Error();
    });
  // expect(app.currentState.value).toBe('Loading');
});

// test('Initial state', () => {
//   const app = new App(machine);
//   expect(app.currentState.value).toBe('Empty');
// });

// test('Unknown transition', () => {
//   const app = new App(machine);
//   expect(() => {
//     app.transition('asdf');
//   }).toThrowError();
// });

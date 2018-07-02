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

  this.store = createStore(reducer, {});

  this.store.subscribe(() => {
    this.dispatch(this.store.getState());
  });
}
App.prototype.dispatch = function(state) {
  //
};
App.prototype.transition = function(event) {
  console.log(`Transitioning from ${this.currentState.value} using ${event}`);
  const curr = this._machine.transition(this.currentState, event);
  this.currentState = curr;
  if (curr.actions && curr.actions.length) {
    return Promise.all(curr.actions.map(action => this[action]()));
  }
  return new Promise(resolve => resolve());
};

// Dummy async loader
function doLoadMarkdown() {
  // QUESTION: How do I fake a delay here with setTimeout?
  // return new Promise(resolve => setTimeout(() => resolve('myFile.md'), 200));
  return new Promise(resolve => resolve('myFile.md'));
}

// Instance method matches `onEntry` state action
App.prototype.loadMarkdown = function() {
  return new Promise((resolve, reject) => {
    doLoadMarkdown()
      .then(file => {
        console.log(file);
        this.store.dispatch({ type: 'LOAD_MARKDOWN', payload: { file } });
        this.transition('success');
        resolve();
      })
      .catch(error => {
        this.store.dispatch({
          type: 'LOAD_MARKDOWN_ERROR',
          payload: { error }
        });
        this.transition('error');
        reject();
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

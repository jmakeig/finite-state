import Stateful from './stateful.js';
import markdown from '../src/states/machine.js';

function App(state) {
  Stateful.call(this, markdown, reducer, state);
  function reducer(state, action) {
    // `action.type` comes from the state transition name
    switch (action.type) {
      case 'success':
      case 'error':
        return assign(state, { file: action.payload });
      case 'selectText':
        return assign(state, { selection: action.payload });
      case 'cancel':
        return without(state, 'selection');
    }
    return state;
  }
}
App.prototype = Object.create(Stateful.prototype);
App.prototype.constructor = App;

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

App.prototype.clearSelection = function() {
  return Promise.resolve('cleared the selection');
};

function assign(obj, ...props) {
  return Object.assign({}, obj, ...props);
}

function without(obj, ...props) {
  const tmp = assign(obj);
  for (const prop of props) {
    delete tmp[prop];
  }

  return tmp;
}

export default App;

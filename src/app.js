import Stateful from './stateful.js';
import markdown from '../src/states/machine.js';
import { uuidv4 as uuid } from 'uuid';
import { shallowClone, without } from './util.js';

function App(state) {
  Stateful.call(this, markdown, reducer, state);
  function reducer(state, action) {
    // `action.type` comes from the state transition name
    // FIXME: To do this by convention, these names need to be unique
    //        Probably need to pass in some sort of metadata from the
    //        state machine.
    switch (action.type) {
      case 'Document.Loading.success':
      case 'ocument.Loading.error':
        return shallowClone(state, { file: action.payload });
      case 'Document.DocumentLoaded.selectText':
        return shallowClone(state, { selection: action.payload });
      case 'Document.SelectedText.cancel':
        return without(state, 'selection');
      case 'Document.DocumentLoaded.selectAnnotation':
        return shallowClone(state, action.payload);
    }
    if (!/^@@redux/.test(action.type)) {
      console.warn(`Unhandled action type: ${action.type}`);
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

function doLoadAnnotation(id) {
  return Promise.resolve({
    activeAnnotation: {
      id: 'B',
      created: '2017-07-12T21:58:17.940Z',
      user: 'dsthubbins',
      range: {
        text: 'this is what is selected',
        start: { line: 88, column: 15 },
        end: { line: 89, column: 2 }
      },
      comment: 'this is B’s comment'
    }
  });
}

App.prototype.loadAnnotation = function loadAnnotation() {
  // return doLoadAnnotation(this.state.activeAnnotation)
  //   .then(active => this.transition())
  //   .catch(error => this.transition());
};

// App.prototype.createAnnotation = function createAnnotation() {
//   this.transition('edit', {});
// };

// TODO: What about updates to appstate that aren’t the result of a state transition?

export default App;

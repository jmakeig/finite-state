import Stateful from './stateful.js';
import markdown from './states/machine.js';
import uuidv4 from 'uuid';
import { shallowClone, without } from './util.js';
import * as logger from './logger.js';

function App(model) {
  Stateful.call(this, markdown, reducer, model);
  function reducer(model, action) {
    // `action.type` comes from the state transition name
    // FIXME: To do this by convention, these names need to be unique
    //        Probably need to pass in some sort of metadata from the
    //        state machine.
    switch (action.type) {
      case 'Document.Loading.success':
      case 'Document.Loading.error':
        return shallowClone(model, { document: action.payload });
      case 'Document.DocumentLoaded.selectText':
        return {
          document: { ...model.document },
          ui: { ...model.ui, currentSelection: action.payload }
        };
      case 'Document.SelectedText.cancel':
        return {
          ui: { ...Object.assign(model.ui, { currentSelection: null }) },
          document: { ...model.document }
        };
      case 'Document.DocumentLoaded.selectAnnotation':
        return {
          ui: { ...model.ui, ...action.payload },
          document: { ...model.document }
        };
      case 'Annotation.ActiveAnnotation.Loading.success':
      case 'Document.SelectedText.annotate':
      case 'Annotation.NewAnnotation.edit':
        return {
          ui: { ...model.ui },
          document: { ...model.document }
        };
    }
    if (!/^@@redux/.test(action.type)) {
      logger.warn(`Unhandled action type: ${action.type}`);
    }
    // logger.log(state);
    return model;
  }
}
App.prototype = Object.create(Stateful.prototype);
App.prototype.constructor = App;

// FIXME: Dummy async loader
function doLoadMarkdown() {
  // FIXME: How do I fake a delay here with setTimeout?
  // return new Promise(resolve => setTimeout(() => resolve('myFile.md'), 200));
  const payload = {
    href: 'some-file.md',
    content: '# Hello, world!\n\nIpsum lorem…',
    mime: 'text/markdown',
    annotations: []
  };
  // TODO: Load and parse Markdown file from the file system
  return Promise.resolve(payload);
}

/**
 * Instance method matches `onEntry` state action
 *
 * @return Promise
 */
App.prototype.loadMarkdown = function loadMarkdown() {
  return doLoadMarkdown()
    .then(file => {
      return this.transition('success', file);
    })
    .catch(error => {
      return this.transition('error', error);
    });
};

App.prototype.clearSelection = function clearSelection() {
  return Promise.resolve('cleared the selection');
};

function doLoadAnnotation(id) {
  return Promise.resolve({
    activeAnnotation: {
      id: 'B',
      timestamp: '2017-07-12T21:58:17.940Z',
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

function annotationByID(annotations, id) {
  /*
  if (!Array.isArray(annotations)) {
    const t = type(annoations);
    const msg = `${t}: The \`annotations\` property should be an Array. How did you get here?`;
    throw new AppStateError(msg);
  }
  */
  const annotation = annotations.find(annotation => id === annotation.id);
  if (undefined === annotation) {
    throw new ReferenceError(`Annotation does not exist: ${id}`);
  }
  return annotation;
}

// D’oh! This doesn’t need to be async since it’s coming out
// of the appstate, but it doesn’t hurt and it’s future-proof.
App.prototype.loadAnnotation = function loadAnnotation() {
  return doLoadAnnotation(this.model.activeAnnotation)
    .then(active =>
      this.transition('success', {
        activeAnnotation: annotationByID(
          this.model.annotations,
          this.model.activeAnnotation
        )
      })
    )
    .catch(error => this.transition('error', error));
};

App.prototype.createAnnotation = function createAnnotation() {
  const newAnnotation = {
    id: uuidv4(),
    timestamp: null, // TODO: Capture timestamp on save
    user: this.model.ui.user, // FIXME: Need to get logged in user from the appstate
    comment: null,
    range: this.model.currentselection
  };
  this.transition('edit', { activeAnnotation: newAnnotation });
};

// TODO: What about updates to appstate that aren’t the result of a state transition?

export default App;

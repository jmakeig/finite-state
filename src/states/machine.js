// import login from './login.js';
// import doc from './document.js';

export default {
  strict: true,
  key: 'Markdown',
  initial: 'Empty',
  states: {
    Empty: {
      on: {
        load: 'Loading'
      }
    },
    Loading: {
      on: {
        error: 'Error',
        success: 'Document'
      },
      activities: ['loadMarkdown']
      // onEntry: 'enterLoading',
      // onExit: 'exitLoading'
    },
    Document: {
      on: {
        selectText: 'TextSelected',
        selectAnnotation: 'NewAnnotation'
      }
    },
    Error: {},
    TextSelected: {
      on: {
        annotate: 'NewAnnotation',
        cancel: 'Document'
      },
      onExit: ['clearSelection']
    },
    NewAnnotation: {}
  }
};

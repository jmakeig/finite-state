// import login from './login.js';
// import doc from './document.js';

import { Machine } from 'xstate';

const markdown = {
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
      onEntry: ['loadMarkdown']
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
        annotate: 'NewAnnotation'
      }
    },
    NewAnnotation: {}
  }
};

const machine = Machine(markdown);

export default machine;

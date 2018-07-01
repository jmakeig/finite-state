export default {
  key: 'Markdown',
  initial: 'Empty',
  states: {
    Empty: {
      on: {
        load: 'Document',
        error: 'Error',
      },
    },
    Document: {
      on: {
        selectText: 'TextSelected',
        selectAnnotation: 'ActiveAnnotation',
      },
    },
    Error: {},
    TextSelected: {
      on: {
        annotate: 'NewAnnotation',
      },
    },
    NewAnnotation: {
      on: {
        edit: 'AnnotationEditing',
      },
    },
    ActiveAnnotation: {
      on: {
        edit: 'AnnotationEditing',
      },
    },
    AnnotationEditing: {
      initial: 'Synched',
      on: {
        done: 'ActiveAnnotation',
      },
      states: {
        Synched: {
          on: {
            change: 'Dirty',
          },
        },
        Dirty: {
          on: {
            save: 'SaveIntent',
            cancel: 'Synched',
          },
        },
        SaveIntent: {
          on: {
            saved: 'Synched',
            cancel: 'Synched',
            onError: 'SaveError',
          },
        },
        SaveError: {},
      },
    },
  },
};

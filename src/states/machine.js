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
    },
    Document: {
      id: 'Document',
      on: {
        selectText: 'TextSelected',
        selectAnnotation: 'Annotation'
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
    NewAnnotation: {
      on: {
        '': 'Annotation'
      }
    },
    Annotation: {
      initial: 'ActiveAnnotation',
      states: {
        ActiveAnnotation: {
          on: {
            edit: 'Editing',
            done: '#Document'
          }
        },
        Editing: {
          initial: 'Synched',
          on: {
            done: 'ActiveAnnotation'
          },
          states: {
            Synched: {
              on: {
                change: 'Dirty'
              }
            },
            Dirty: {
              on: {
                save: 'Saving',
                cancel: 'Synched'
              }
            },
            Saving: {
              on: {
                saved: 'Synched',
                cancel: 'Synched',
                error: 'SaveError'
              }
            },
            SaveError: {}
          }
        }
      }
    }
  }
};

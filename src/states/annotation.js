export default {
  key: 'Annotation',
  initial: 'NoSelection',
  states: {
    NoSelection: {
      on: {
        createNew: 'NewAnnotation',
        select: 'ActiveAnnotation',
      },
    },
    NewAnnotation: {
      on: {
        edit: 'Editing',
      },
    },
    ActiveAnnotation: {
      on: {
        edit: 'Editing',
      },
    },
    Editing: {
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

export default {
  strict: true,
  key: 'Markdown',
  initial: 'Document',
  states: {
    Document: {
      initial: 'Empty',
      on: {
        selectAnnotation: '#ActiveAnnotation',
        reload: '.Empty'
      },
      states: {
        Empty: {
          on: {
            load: 'Loading'
          }
        },
        Loading: {
          on: {
            success: 'DocumentLoaded',
            error: 'Error'
          },
          activities: ['loadMarkdown']
        },
        DocumentLoaded: {
          id: 'DocumentLoaded',
          on: {
            selectText: 'SelectedText'
          }
        },
        Error: {},
        SelectedText: {
          on: {
            annotate: '#NewAnnotation',
            cancel: 'DocumentLoaded'
          },
          onExit: ['clearSelection']
        }
      }
    },
    Annotation: {
      initial: 'ActiveAnnotation',
      on: {
        close: '#DocumentLoaded'
      },
      onExit: 'cleanUpAnnotation',
      states: {
        NewAnnotation: {
          id: 'NewAnnotation',
          on: {
            edit: '#Dirty'
          },
          activities: ['createAnnotation']
        },
        ActiveAnnotation: {
          id: 'ActiveAnnotation',
          initial: 'Loading',
          states: {
            Loading: {
              on: {
                success: 'Viewing',
                error: 'Error'
              },
              activities: ['loadAnnotation']
            },
            Viewing: {
              id: 'Viewing',
              on: {
                edit: 'Editing'
              }
            },
            Editing: {
              id: 'Editing',
              initial: 'Synched',
              on: {
                abandon: '#Viewing'
              },
              states: {
                Synched: {
                  on: {
                    change: 'Dirty'
                  }
                },
                Dirty: {
                  id: 'Dirty',
                  on: {
                    change: 'Dirty',
                    save: 'Saving'
                  },
                  onEntry: 'flagDirty'
                },
                Saving: {
                  on: {
                    success: 'Synched',
                    error: 'Error'
                  }
                },
                Error: {
                  on: {
                    change: 'Dirty'
                  }
                }
              }
            },
            Error: {}
          }
        }
      }
    }
  }
};

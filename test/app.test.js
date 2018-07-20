import { matchers } from 'jest-json-schema';
import * as schema from '../model.schema.json';

import App from '../src/app.js';

expect.extend(matchers);

test('failing `Promise` test does *not* time out', () => {
  expect.assertions(2);
  return Promise.resolve().then(() => {
    expect(!false).toBe(true);
    expect(1).toBe(1);
  });
});

test('Unknown transition in strict mode', () => {
  const app = new App();
  expect(() => {
    app.transition('asdf');
  }).toThrowError();
});

test('Initial state', () => {
  const app = new App();
  expect(app.currentState.value).toEqual({ Document: 'Empty' });
});

test('load', () => {
  expect.hasAssertions();
  const init = {
    currentState: { Document: 'Empty' },
    state: {
      ui: {
        state: 'Empty',
        user: 'dsmalls',
        currentSelection: null,
        activeAnnotation: null
      },
      document: {
        href: null,
        content: null,
        mime: null,
        annotations: []
      }
    }
  };
  const app = new App(init);
  expect(app).toBeInstanceOf(App);
  expect(app.state).toMatchSchema(schema);
  return app.transition('load').then(() => {
    expect(app.state).toMatchSchema(schema);
    expect(app.currentState.value).toEqual({ Document: 'DocumentLoaded' });
    expect(app.state.document.href).toBe('some-file.md');
    expect(app.state.document.content).toMatch(/^# Hello, world!/);
  });
});

test('selectText', () => {
  expect.hasAssertions();
  const app = new App({
    currentState: { Document: 'DocumentLoaded' },
    state: {
      ui: {
        state: 'DocumentLoaded',
        user: null,
        currentSelection: null,
        activeAnnotation: null
      },
      document: {
        href: 'file.md',
        content: '# Asdf',
        mime: 'text/markdown',
        annotations: []
      }
    }
  });
  return app
    .transition('selectText', {
      // text: 'this is what is selected',
      start: { line: 33, column: 14 },
      end: { line: 34, column: 77 }
    })
    .then(() => {
      expect(app.currentState.value).toEqual({ Document: 'SelectedText' });
      expect(app.state).toMatchSchema(schema);
      expect(app.state.ui.currentSelection.start.line).toBe(33);
      expect(app.state.ui.currentSelection.end.column).toBe(77);
    });
});

test('cancel text selection', () => {
  expect.hasAssertions();
  const app = new App({
    currentState: { Document: 'SelectedText' },
    state: {
      ui: {
        state: 'SelectedText',
        user: 'dsmalls',
        currentSelection: {
          text: 'this is what is selected',
          start: { line: 33, column: 14 },
          end: { line: 34, column: 77 }
        },
        activeAnnotation: null
      },
      document: {
        href: 'X',
        content: '# Asdf\n\n',
        mime: 'text/markdown',
        annotations: []
      }
    }
  });
  expect(app.state).toMatchSchema(schema);
  return app.transition('cancel').then(() => {
    expect(app.currentState.value).toEqual({ Document: 'DocumentLoaded' });
    expect(app.state.ui.currentSelection).toBeNull();
  });
});

test('annotate selected text', () => {
  expect.hasAssertions();

  const app = new App({
    currentState: { Document: 'SelectedText' },
    state: {
      ui: {
        state: 'SelectedText', // FIXME
        user: 'dsmalls',
        currentSelection: {
          // text: 'this is what is selected',
          start: { line: 33, column: 14 },
          end: { line: 34, column: 77 }
        },
        activeAnnotation: null
      },
      document: {
        href: 'file.md',
        content: '…',
        mime: 'text/markdown',
        annotations: []
      }
    }
  });
  expect(app.state).toMatchSchema(schema);
  return app.transition('annotate').then(() => {
    expect(app.currentState.value).toEqual({
      Annotation: { ActiveAnnotation: { Editing: 'Dirty' } }
    });
    // expect(app.state.activeAnnotation.id).not.toBeUndefined();
    // expect(app.state.activeAnnotation.created).toBeNull();
    // expect(app.state.activeAnnotation.user).toBe('dsmalls');
    expect(app.state).toMatchSchema(schema);
    // TODO: expect(app.state.selection).toBeUndefined();
  });
});

test('select annotation', () => {
  expect.hasAssertions();

  const app = new App({
    currentState: { Document: 'DocumentLoaded' },
    state: {
      document: {
        href: 'file.md',
        mime: 'text/markdown',
        content: '…', // Markdown
        annotations: [
          {
            id: 'f55c9bd0-e6b6-48e1-9a3f-6fa1cb3a9115',
            created: '2018-07-12T21:58:17.940Z',
            user: 'dsmalls',
            range: {
              text: 'this is what is selected',
              start: { line: 33, column: 14 },
              end: { line: 34, column: 77 }
            },
            comment: 'this is A’s comment'
          },
          {
            id: 'c99fb735-242a-44fb-bc53-0c778b1006a1',
            created: '2017-07-12T21:58:17.940Z',
            user: 'dsthubbins',
            range: {
              text: 'this is what is selected',
              start: { line: 88, column: 15 },
              end: { line: 89, column: 2 }
            },
            comment: 'this is B’s comment'
          },
          {
            id: '60c8c44b-53dd-434f-b989-cc61f38bf7f5',
            created: '2014-07-12T21:58:17.940Z',
            user: 'dsmalls',
            range: {
              text: 'this is what is selected',
              start: { line: 122, column: 1 },
              end: { line: 123, column: 77 }
            },
            comment: 'this is C’s comment'
          }
        ]
      },
      ui: {
        state: 'DocumentLoaded',
        user: 'dsmalls',
        activeAnnotation: null,
        currentSelection: null
      }
    }
  });
  expect(app.state).toMatchSchema(schema);
  return (
    app
      .transition('selectAnnotation', {
        activeAnnotation: {
          id: 'c99fb735-242a-44fb-bc53-0c778b1006a1',
          created: '2017-07-12T21:58:17.940Z',
          user: 'dsthubbins',
          range: {
            text: 'this is what is selected',
            start: { line: 88, column: 15 },
            end: { line: 89, column: 2 }
          },
          comment: 'this is B’s comment'
        }
      })
      // { ActiveAnnotation: 'Loading' } happens in App.prototype.loadAnnotation
      .then(() => {
        expect(app.state).toMatchSchema(schema);
        expect(app.state.ui.activeAnnotation).toEqual({
          id: 'c99fb735-242a-44fb-bc53-0c778b1006a1',
          created: '2017-07-12T21:58:17.940Z',
          user: 'dsthubbins',
          range: {
            text: 'this is what is selected',
            start: { line: 88, column: 15 },
            end: { line: 89, column: 2 }
          },
          comment: 'this is B’s comment'
        });
      })
  );
});

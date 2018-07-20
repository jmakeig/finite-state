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
  const app = new App();
  expect(app).toBeInstanceOf(App);
  return app.transition('load').then(() => {
    expect(app.currentState.value).toEqual({ Document: 'DocumentLoaded' });
    expect(app.state.document.href).toBe('some-file.md');
    expect(app.state.document.content).toMatch(/^# Hello, world!/);
  });
});

test('selectText', () => {
  expect.hasAssertions();
  const start = {
    currentState: { Document: 'DocumentLoaded' },
    state: {
      ui: { state: 'DocumentLoaded', user: null, currentSelection: null },
      document: { href: 'file.md', content: '# Asdf', annotations: [] }
    }
  };
  const app = new App(start);
  return app
    .transition('selectText', {
      // text: 'this is what is selected',
      start: { line: 33, column: 14 },
      end: { line: 34, column: 77 }
    })
    .then(() => {
      expect(app.currentState.value).toEqual({ Document: 'SelectedText' });
      expect(app.state.currentselection.start.line).toBe(33);
      expect(app.state.currentselection.end.column).toBe(77);
    });
});

test('cancel text selection', () => {
  expect.hasAssertions();
  const start = {
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
        activeAnnotationID: null
      },
      document: {
        href: 'X',
        content: '# Asdf\n\n',
        mime: 'text/markdown',
        annotations: []
      }
    }
  };
  expect(start.state).toMatchSchema(schema);
  const app = new App(start);
  return app.transition('cancel').then(() => {
    expect(app.currentState.value).toEqual({ Document: 'DocumentLoaded' });
    expect(app.state.ui.currentSelection).toBeNull();
  });
});

test('annotate selected text', () => {
  expect.hasAssertions();

  const start = {
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
        activeAnnotationID: null
      },
      document: {
        href: 'file.md',
        content: '…',
        mime: 'text/markdown',
        annotations: []
      }
    }
  };

  expect(start.state).toMatchSchema(schema);

  const app = new App(start);
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

  const start = {
    currentState: { Document: 'DocumentLoaded' },
    state: {
      file: { name: 'file.md' },
      text: '…', // Markdown
      annotations: [
        {
          id: 'A',
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
          id: 'B',
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
          id: 'A',
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
    }
  };

  const app = new App(start);
  return (
    app
      .transition('selectAnnotation', { activeAnnotation: 'B' })
      // { ActiveAnnotation: 'Loading' } happens in App.prototype.loadAnnotation
      .then(() => {
        expect(app.state.activeAnnotation.id).toBe('B');
      })
  );
});

import App from '../src/app.js';

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
    expect(app.state.file.name).toBe('some-file.md');
    expect(app.state.file.markdown).toMatch(/^# Hello, world!/);
  });
});

test('selectText', () => {
  expect.hasAssertions();
  const start = {
    currentState: { Document: 'DocumentLoaded' },
    state: { file: { name: 'file.md' } }
  };
  const app = new App(start);
  return app
    .transition('selectText', {
      text: 'this is what is selected',
      start: { line: 33, column: 14 },
      end: { line: 34, column: 77 }
    })
    .then(() => {
      expect(app.currentState.value).toEqual({ Document: 'SelectedText' });
      expect(app.state.selection.start.line).toBe(33);
      expect(app.state.selection.end.column).toBe(77);
    });
});

test('cancel text selection', () => {
  expect.hasAssertions();
  const start = {
    currentState: { Document: 'SelectedText' },
    state: {
      file: { name: 'X' },
      selection: {
        text: 'this is what is selected',
        start: { line: 33, column: 14 },
        end: { line: 34, column: 77 }
      }
    }
  };
  const app = new App(start);
  return app.transition('cancel').then(() => {
    expect(app.currentState.value).toEqual({ Document: 'DocumentLoaded' });
    expect(app.state.selection).toBeUndefined();
  });
});

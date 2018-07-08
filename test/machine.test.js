import App from '../src/app.js';

// test('failing `Promise` test does time out', () => {
//   expect.assertions(2);
//   return Promise.resolve().then(() => {
//     expect(!false).toBe(true);
//     expect(1).toBe(1);
//   });
// });

test('load', () => {
  expect.hasAssertions();
  const app = new App();
  expect(app).toBeInstanceOf(App);
  return app.transition('load').then(() => {
    expect(app.currentState.value).toBe('Document');
    expect(app.state.file.name).toBe('some-file.md');
    expect(app.state.file.markdown).toMatch(/^# Hello, world!/);
  });
});
/*
test('selectText', () => {
  expect.hasAssertions();
  const start = {
    currentState: 'Document',
    state: { file: { name: 'X' } }
  };
  const app = new App(start);
  return app
    .transition('selectText', {
      text: 'this is what is selected',
      start: { line: 33, column: 14 },
      end: { line: 34, column: 77 }
    })
    .then(() => {
      expect(app.currentState.value).toBe('TextSelected');
      expect(app.state.selection.start.line).toBe(33);
      expect(app.state.selection.end.column).toBe(77);
    });
});

test('cancel text selection', () => {
  expect.hasAssertions();
  const start = {
    currentState: 'TextSelected',
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
    expect(app.currentState.value).toBe('Document');
    expect(app.state.selection).toBeUndefined();
  });
});

test('Initial state', () => {
  const app = new App();
  expect(app.currentState.value).toBe('Empty');
});

test('Unknown transition', () => {
  const app = new App();
  expect(() => {
    app.transition('asdf');
  }).toThrowError();
});
*/

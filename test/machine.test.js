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
    expect(app.state.file.name).toBe('some-file.md');
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

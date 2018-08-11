import Stateful from '../src/stateful.js';

test('.state is read-only', () => {
  const machine = {
    strict: true,
    key: 'Stateful',
    initial: 'Start',
    states: {
      Start: {}
    }
  };
  const stateful = new Stateful(machine);
  expect(stateful).toBeDefined();
  expect(stateful.state.value).toEqual('Start');
  expect(() => {
    stateful.state = { newState: 'asdf' };
  }).toThrowError(TypeError);
});

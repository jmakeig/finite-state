import * as util from '../src/util.js';

test('shallowClone', () => {
  const input = { a: 'A', b: { c: 'C' } };
  expect(util.shallowClone(input)).not.toBe(input);
  expect(util.shallowClone(input)).toEqual(input);
  expect(util.shallowClone(input, { b: 'B' })).not.toBe(input);
  expect(util.shallowClone(input, { b: 'B' })).toEqual({ a: 'A', b: 'B' });
  const nullConsturctor = Object.assign(Object.create(null), { b: 'B' });
  expect(util.shallowClone(nullConsturctor)).toEqual({ b: 'B' });
  expect(util.shallowClone(nullConsturctor).constructor).toBeUndefined();
  expect(util.shallowClone()).toEqual(Object.create(null));
  expect(util.shallowClone(null)).toBeNull();
});

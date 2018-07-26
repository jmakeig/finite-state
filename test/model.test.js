import { matchersWithOptions } from 'jest-json-schema';
import * as schema from '../model.schema.json';

expect.extend(matchersWithOptions({ validateSchema: true }));

test('Valid schema', () => {
  expect(schema).toBeValidSchema();
});

test('Dummy instance', () => {
  expect(schema).toBeValidSchema();
  const model = {
    ui: {
      state: 'Empty',
      user: null,
      currentSelection: null,
      activeAnnotation: null
    },
    document: {
      href: null,
      mime: null,
      content: null,
      annotations: []
    }
  };
  expect(model).toMatchSchema(schema);
});

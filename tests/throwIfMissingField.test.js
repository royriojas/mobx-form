import { createModel } from '../src/FormModel';
describe('FormModel.options.throwIfMissingField', () => {
  describe('if throwIfMissingField is true', () => {
    it('should complain if trying to set the initial state of a missing field', () => {
      expect(() => {
        createModel({
          descriptors: { name: {}, lastName: {} },
          initialState: {
            name: 'Snoopy',
            lastName: 'Brown',
            missingField: 'this is an extra field',
          },
          options: {
            throwIfMissingField: true,
          },
        });
      }).toThrowErrorMatchingInlineSnapshot('"Field \\"missingField\\" not found"');
    });
  });

  describe('if throwIfMissingField is not specified it should behave as if it is true by default', () => {
    it('should not throw if ', () => {
      expect(() => {
        createModel({
          descriptors: { name: {}, lastName: {} },
          initialState: {
            name: 'Snoopy',
            lastName: 'Brown',
            missingField: 'this is an extra field',
          },
        });
      }).toThrowErrorMatchingInlineSnapshot('"Field \\"missingField\\" not found"');
    });
  });

  describe('if throwIfMissingField is false', () => {
    it('should not throw if ', () => {
      let model;
      expect(() => {
        model = createModel({
          descriptors: { name: {}, lastName: {} },
          initialState: {
            name: 'Snoopy',
            lastName: 'Brown',
            missingField: 'this is an extra field',
          },
          options: {
            throwIfMissingField: false,
          },
        });
      }).not.toThrow('Field \\"missingField\\" not found');
      expect(model.fields.name.value).toEqual('Snoopy');
      expect(model.fields.lastName.value).toEqual('Brown');
    });
  });
});

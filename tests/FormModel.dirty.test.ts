import { describe, it, expect } from 'bun:test';
import { createModel } from '../src/index';

describe('FormModel.dirty', () => {
  it('should be false when creating the formModel with no initialState', () => {
    const model = createModel({
      descriptors: { name: {}, lastName: {} },
    });
    expect(model.dirty).toEqual(false);
  });

  it('should be false when creating the formModel with initialState', () => {
    const model = createModel({
      initialState: {
        name: 'Snoopy',
        lastName: 'Brown',
      },
      descriptors: { name: {}, lastName: {} },
    });
    expect(model.dirty).toEqual(false);
  });

  it('should be true when changing the value of a field', () => {
    const model = createModel({
      initialState: {
        name: 'Snoopy',
        lastName: 'Brown',
      },
      descriptors: { name: {}, lastName: {} },
    });
    model.fields.name.setValue('Charlie');
    expect(model.dirty).toEqual(true);
  });

  it('should be back to false when resetting the value of a field', () => {
    const model = createModel({
      initialState: {
        name: 'Snoopy',
        lastName: 'Brown',
      },
      descriptors: { name: {}, lastName: {} },
    });
    model.fields.name.setValue('Charlie');
    expect(model.dirty).toEqual(true);
    model.fields.name.restoreInitialValue();
    expect(model.dirty).toEqual(false);
  });

  it('should be back to false when resetting the value of a field by setting the original value', () => {
    const model = createModel({
      initialState: {
        name: 'Snoopy',
        lastName: 'Brown',
      },
      descriptors: { name: {}, lastName: {} },
    });
    model.fields.name.setValue('Charlie');
    expect(model.dirty).toEqual(true);
    model.fields.name.setValue('Snoopy');
    expect(model.dirty).toEqual(false);
  });

  describe('commit', () => {
    it('commit should set dirty to false', () => {
      const model = createModel({
        initialState: {
          name: 'Snoopy',
          lastName: 'Brown',
        },
        descriptors: { name: {}, lastName: {} },
      });
      model.fields.name.setValue('Charlie');
      expect(model.dirty).toEqual(true);
      model.commit();
      expect(model.dirty).toEqual(false);
    });
  });
});

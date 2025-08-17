import { createModel } from '../src/index';

describe('FormModel with boolean fields', () => {
  it('it should not complain value is required if value is set to a boolean', async () => {
    const model = createModel({
      descriptors: { name: {}, lastName: {}, isFunny: { required: true } },
      initialState: { name: 'Snoopy', lastName: 'Brown' },
    });

    expect(model.fields.isFunny.value).toEqual(undefined);

    await model.validate();

    expect(model.fields.isFunny.error).toMatchInlineSnapshot('"Field: "isFunny" is required"');

    model.fields.isFunny.setValue(false);

    await model.validate();

    expect(model.fields.isFunny.error).toEqual(undefined);
  });
});

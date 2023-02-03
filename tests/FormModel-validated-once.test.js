import { createModel } from '../src/FormModel';

describe('FormModel.validatedAtLeastOnce', () => {
  it('should be false initially as no validation was executed', () => {
    const model = createModel({
      descriptors: {
        appId: {
          required: true,
        },
        url: {
          required: true,
          validator: async field => {
            if (!field.value.match(/^http(s*):\/\//)) {
              throw new Error('Not a valid URL');
            }
          },
        },
      },
    });

    expect(model.validatedAtLeastOnce).toEqual(false);
  });

  it('should be true once all fields were validated once', async () => {
    const model = createModel({
      descriptors: {
        appId: {
          required: true,
        },
        url: {
          required: true,
          validator: async field => {
            if (!field.value.match(/^http(s*):\/\//)) {
              throw new Error('Not a valid URL');
            }
          },
        },
      },
    });

    await model.validate();

    expect(model.summary).toMatchInlineSnapshot(`
      Array [
        "Field: \\"appId\\" is required",
        "Field: \\"url\\" is required",
      ]
    `);

    expect(model.validatedAtLeastOnce).toEqual(true);
  });

  it("should be true once all fields were validated even if one of them didn't pass validation", async () => {
    const model = createModel({
      descriptors: {
        appId: {
          required: true,
        },
        url: {
          required: true,
          validator: async field => {
            if (!field.value.match(/^http(s*):\/\//)) {
              throw new Error('Not a valid URL');
            }
          },
        },
      },
    });

    model.fields.appId.setValue('testApp');
    model.fields.url.setValue('testUrl');

    await model.validate();

    expect(model.summary).toMatchInlineSnapshot(`
      Array [
        "Not a valid URL",
      ]
    `);

    expect(model.validatedAtLeastOnce).toEqual(true);
  });

  it('should be true once all fields were validated when validation passes', async () => {
    const model = createModel({
      descriptors: {
        appId: {
          required: true,
        },
        url: {
          required: true,
          validator: async field => {
            if (!field.value.match(/^http(s*):\/\//)) {
              throw new Error('Not a valid URL');
            }
          },
        },
      },
    });

    model.fields.appId.setValue('testApp');
    model.fields.url.setValue('http://some.url');

    await model.validate();

    expect(model.valid).toEqual(true);

    expect(model.validatedAtLeastOnce).toEqual(true);
  });

  it('should be false once is reset after being validated once', async () => {
    const model = createModel({
      descriptors: {
        appId: {
          required: true,
        },
        url: {
          required: true,
          validator: async field => {
            if (!field.value.match(/^http(s*):\/\//)) {
              throw new Error('Not a valid URL');
            }
          },
        },
      },
    });

    model.fields.appId.setValue('testApp');
    model.fields.url.setValue('http://some.url');

    await model.validate();

    expect(model.valid).toEqual(true);

    expect(model.validatedAtLeastOnce).toEqual(true);

    model.resetValidatedOnce();

    expect(model.validatedAtLeastOnce).toEqual(false);
  });
});

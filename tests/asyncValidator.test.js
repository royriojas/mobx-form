import { createModel } from '../src/FormModel';

const createDeferred = () => {
  let resolver;
  let rejector;

  const p = new Promise((resolve, reject) => {
    resolver = resolve;
    rejector = reject;
  });

  p.resolve = (...args) => {
    resolver && resolver(...args);
  };

  p.reject = (...args) => {
    rejector && rejector(...args);
  };

  return p;
};

describe('async validators', () => {
  it('should mark the field as validating while validation is being performed', async () => {
    let dfd;

    const model = createModel({
      descriptors: {
        name: {
          validator: () => {
            dfd = createDeferred();

            return dfd;
          },
        },
        lastName: {},
      },
      initialState: { name: 'Snoopy', lastName: 'Brown' },
    });

    const p = model.validate();

    expect(model.fields.name.validating).toEqual(true);

    dfd.resolve();

    await p;

    expect(model.fields.name.validating).toEqual(false);
  });

  it('should mark the field as validating while validation is being performed even if validation fails', async () => {
    let dfd;

    const model = createModel({
      descriptors: {
        name: {
          validator: () => {
            dfd = createDeferred();

            return dfd;
          },
        },
        lastName: {},
      },
      initialState: { name: 'Snoopy', lastName: 'Brown' },
    });

    const p = model.validate();

    expect(model.fields.name.validating).toEqual(true);

    dfd.reject(new Error('Failed name'));

    await p;

    expect(model.fields.name.validating).toEqual(false);

    expect(model.fields.name.error).toEqual('Failed name');
  });

  it('should mark the entire form as validating while validation is on the fly', async () => {
    let dfd;

    const model = createModel({
      descriptors: {
        name: {
          validator: () => {
            dfd = createDeferred();

            return dfd;
          },
        },
        lastName: {},
      },
      initialState: { name: 'Snoopy', lastName: 'Brown' },
    });

    expect(model.validating).toEqual(false);

    const p = model.validate();

    expect(model.validating).toEqual(true);

    dfd.reject(new Error('Failed name'));

    await p;

    expect(model.validating).toEqual(false);
  });

  it('should mark the entire form as validating while validation is on the fly even for a single field', async () => {
    let dfd;

    const model = createModel({
      descriptors: {
        name: {
          validator: () => {
            dfd = createDeferred();

            return dfd;
          },
        },
        lastName: {},
      },
      initialState: { name: 'Snoopy', lastName: 'Brown' },
    });

    expect(model.validating).toEqual(false);

    const p = model.fields.name.validate();

    expect(model.validating).toEqual(true);

    dfd.reject(new Error('Failed name'));

    await p;

    expect(model.validating).toEqual(false);
  });
});

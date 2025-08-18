import { describe, it, expect } from "bun:test";
import { createModel } from "../src/index";

describe("async validators", () => {
  it("should mark the field as validating while validation is being performed", async () => {
    const dfd: PromiseWithResolvers<{ error: string } | boolean> = Promise.withResolvers();

    const model = createModel({
      descriptors: {
        name: {
          validator: () => {
            return dfd.promise;
          },
        },
        lastName: {},
      },
      initialState: { name: "Snoopy", lastName: "Brown" },
    });

    const p = model.validate();

    expect(model.fields.name.validating).toEqual(true);

    dfd.resolve(true);

    await p;

    expect(model.fields.name.validating).toEqual(false);
  });

  it("should mark the field as validating while validation is being performed even if validation fails", async () => {
    const dfd: PromiseWithResolvers<{ error: string } | boolean> = Promise.withResolvers();

    const model = createModel({
      descriptors: {
        name: {
          validator: () => {
            return dfd.promise;
          },
        },
        lastName: {},
      },
      initialState: { name: "Snoopy", lastName: "Brown" },
    });

    const p = model.validate();

    expect(model.fields.name.validating).toEqual(true);

    dfd.reject(new Error("Failed name"));

    await p;

    expect(model.fields.name.validating).toEqual(false);

    expect(model.fields.name.error).toEqual("Failed name");
  });

  it("should mark the entire form as validating while validation is on the fly", async () => {
    const dfd: PromiseWithResolvers<{ error: string } | boolean> = Promise.withResolvers();

    const model = createModel({
      descriptors: {
        name: {
          validator: () => {
            return dfd.promise;
          },
        },
        lastName: {},
      },
      initialState: { name: "Snoopy", lastName: "Brown" },
    });

    expect(model.validating).toEqual(false);

    const p = model.validate();

    expect(model.validating).toEqual(true);

    dfd.reject(new Error("Failed name"));

    await p;

    expect(model.validating).toEqual(false);
  });

  it("should mark the entire form as validating while validation is on the fly even for a single field", async () => {
    const dfd: PromiseWithResolvers<{ error: string } | boolean> = Promise.withResolvers();

    const model = createModel({
      descriptors: {
        name: {
          validator: () => {
            return dfd.promise;
          },
        },
        lastName: {},
      },
      initialState: { name: "Snoopy", lastName: "Brown" },
    });

    expect(model.validating).toEqual(false);

    const p = model.fields.name.validate();

    expect(model.validating).toEqual(true);

    dfd.reject(new Error("Failed name"));

    await p;

    expect(model.validating).toEqual(false);
  });
});

import { createModel, FormModel } from "../src/index";
import { describe, it, expect } from "bun:test";

describe("FormModel.options.throwIfMissingField", () => {
  describe("if throwIfMissingField is true", () => {
    it("should complain if trying to set the initial state of a missing field", () => {
      expect(() => {
        createModel({
          descriptors: { name: {}, lastName: {} },
          initialState: {
            name: "Snoopy",
            lastName: "Brown",
            // @ts-expect-error intentionally passing wrong type
            missingField: "this is an extra field",
          },
          options: {
            throwIfMissingField: true,
          },
        });
      }).toThrowErrorMatchingInlineSnapshot('"Field "missingField" not found"');
    });
  });

  describe("if throwIfMissingField is not specified", () => {
    it("it should behave as if it is true by default", () => {
      expect(() => {
        createModel({
          descriptors: { name: {}, lastName: {} },
          initialState: {
            name: "Snoopy",
            lastName: "Brown",
            // @ts-expect-error intentionally passing wrong type
            missingField: "this is an extra field",
          },
        });
      }).toThrowErrorMatchingInlineSnapshot('"Field "missingField" not found"');
    });
  });

  describe("if throwIfMissingField is false", () => {
    it("should not throw if a field is passed that do not match the ones specified in the descriptors", () => {
      let model: FormModel<{ name: string; lastName: string }>;
      expect(() => {
        model = createModel<{ name: string; lastName: string }>({
          descriptors: { name: {}, lastName: {} },
          initialState: {
            name: "Snoopy",
            lastName: "Brown",
            // @ts-expect-error intentionally passing wrong type
            missingField: "this is an extra field",
          },
          options: {
            throwIfMissingField: false,
          },
        });
      }).not.toThrow('Field \\"missingField\\" not found');

      // @ts-expect-error variable is set in the function from above
      expect(model.fields.name.value).toEqual("Snoopy");
      // @ts-expect-error variable is set in the function from above
      expect(model.fields.lastName.value).toEqual("Brown");
    });
  });
});

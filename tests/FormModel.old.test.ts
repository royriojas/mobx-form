import { reaction } from 'mobx';
import { createModelFromState, FormModel, type Descriptors } from '../src/index';
import { sleep } from '../src/resources/utils';
import { describe, it, expect } from 'bun:test';

describe('form-model', () => {
  describe('restoreInitialValues', () => {
    it('should reset the initial values on the form', () => {
      const model = createModelFromState({ valueA: '', valueB: '' });

      model.updateField('valueA', 'some');
      model.updateField('valueB', 'b');

      expect(model.fields.valueA.value).toEqual('some');
      expect(model.fields.valueB.value).toEqual('b');

      model.restoreInitialValues();
      expect(model.fields.valueA.value).toEqual('');
      expect(model.fields.valueB.value).toEqual('');
    });

    it('should reset the initial values on the form even if not empty strings', () => {
      const model = createModelFromState<{ valueA: number[], valueB: number[] }>({ valueA: [], valueB: [] });

      model.updateField('valueA', [1, 2, 3]);
      model.updateField('valueB', [4, 5, 6]);

      expect(model.fields.valueA.value).toEqual([1, 2, 3]);
      expect(model.fields.valueB.value).toEqual([4, 5, 6]);

      model.restoreInitialValues();

      expect(model.fields.valueA.value).toEqual([]);
      expect(model.fields.valueB.value).toEqual([]);
    });
  });

  describe('serializedData', () => {
    it('should return always the data serialized as a Javascript object', () => {
      const model = createModelFromState({ name: 'John', lastName: 'Doe' });
      expect(model.serializedData).toEqual({ name: 'John', lastName: 'Doe' });

      model.updateField('name', 'Jane');
      model.updateField('lastName', 'Martins');

      expect(model.serializedData).toEqual({
        name: 'Jane',
        lastName: 'Martins',
      });
    });
  });

  describe('requiredAreFilled', () => {
    it('should be true if all required fields have a value', () => {
      const initialState = { name: '', lastName: '', email: '' };
      const model = createModelFromState(
        initialState,
        {
          name: { required: 'The name is required' },
          lastName: {
            // required: ({ fields }) => !!fields.name.value && 'lastName is required',
          },
          email: {
            // required: ({ fields }) => fields.lastName.value === 'Doo' && 'Email is required for all Doos',
          }, // only required when last name is Doo
        },
      );

      const stop = reaction(
        () => {
          const { name, email, lastName } = model.fields;
          return {
            name: name.value,
            lastName: lastName.value,
            email: email.value,
            fields: model.fields,
          };
        },
        ({ fields }) => {
          fields.lastName.setRequired(!!fields.name.value && 'lastName is required');
          fields.email.setRequired(fields.lastName.value === 'Doo' && 'Email is required for all Doos');
        },
      );

      expect(model.requiredAreFilled).toBe(false);
      expect(model.requiredFields).toEqual(['name']);

      model.updateField('name', 'John');

      expect(model.requiredAreFilled).toBe(false); // now lastName is also required!
      expect(model.requiredFields.sort()).toEqual(['name', 'lastName'].sort() as (keyof typeof initialState)[]);

      model.updateField('lastName', 'Doo');

      expect(model.requiredFields.sort()).toEqual(['name', 'lastName', 'email'].sort() as (keyof typeof initialState)[]);
      expect(model.requiredAreFilled).toBe(false);

      model.updateField('email', 'some@email.com');
      expect(model.requiredAreFilled).toBe(true);

      stop();
    });

    it('should allow the creation of a form that will track if all required fields are filled', async () => {
      const model = createModelFromState(
        { name: '', lastName: '', email: '' },
        {
          // using generic validation
          name: { required: 'Name is required' },
          // using a custom validation functiont that returns a Boolean
          lastName: {
            required: 'lastName is required',
            validator: field => field.value !== 'Doe',
            errorMessage: 'Please do not enter Doe',
          },
          // using an async function that throws when it fails, since throws are converted to rejections
          // this just works. If validation passed no need to return anything.
          email: {
            validator: async ({ value }) => {
              await sleep(100);

              if (value === 'johndoe@gmail.com') {
                throw new Error('Email already used');
              }
            },
          },
        },
      );

      expect(model.requiredAreFilled).toEqual(false);

      model.updateField('name', 'Snoopy');
      expect(model.requiredAreFilled).toEqual(false);

      model.updateField('lastName', 'Doo');
      expect(model.requiredAreFilled).toEqual(true);

      await model.validate();
      expect(model.valid).toEqual(true);

      model.updateFrom({
        name: '',
        lastName: 'Doe',
        email: 'johndoe@gmail.com',
      });

      await model.validate();

      expect(model.valid).toEqual(false);

      expect(model.summary).toEqual(['Name is required', 'Please do not enter Doe', 'Email already used']);
    });

    it('errors thrown inside the validator execution should not break the validation when validation is not async', async () => {
      const model = createModelFromState(
        { name: '', lastName: '', email: '' },
        {
          // using generic validation
          name: { required: 'Name is required' },
          // using a custom validation functiont that returns a Boolean
          lastName: {
            required: 'lastName is required',
            validator: field => field.value !== 'Doe',
            errorMessage: 'Please do not enter Doe',
          },
          // using an async function that throws when it fails, since throws are converted to rejections
          // this just works. If validation passed no need to return anything.
          email: {
            validator: ({ value }) => {
              if (value === 'johndoe@gmail.com') {
                throw new Error('Email already used');
              }
            },
          },
        },
      );

      expect(model.requiredAreFilled).toEqual(false);

      model.updateField('name', 'Snoopy');
      expect(model.requiredAreFilled).toEqual(false);

      model.updateField('lastName', 'Doo');
      expect(model.requiredAreFilled).toEqual(true);

      await model.validate();
      expect(model.valid).toEqual(true);

      model.updateFrom({
        name: '',
        lastName: 'Doe',
        email: 'johndoe@gmail.com',
      });

      await model.validate();
      expect(model.valid).toEqual(false);

      expect(model.summary).toEqual(['Name is required', 'Please do not enter Doe', 'Email already used']);
    });

    it('should allow validators to access fields in the model', async () => {
      type CustomModel = FormModel<{ name: string, lastName: string, email: string }> & {validateEmails: boolean};
      const model = createModelFromState(
        { name: 'Snoopy', lastName: 'Brown', email: '' },
        {
          // using generic validation
          name: { required: 'Name is required' },
          // using a custom validation functiont that returns a Boolean
          lastName: {
            required: 'lastName is required',
            validator: field => field.value !== 'Doe',
            errorMessage: 'Please do not enter Doe',
          },
          // using an async function that throws when it fails, since throws are converted to rejections
          // this just works. If validation passed no need to return anything.
          email: {
            validator: ({ value = '' }, fields, _model) => {
              if ((_model as CustomModel).validateEmails) {
                if (!(value.indexOf('@') > 1)) {
                  throw new Error('INVALID_EMAIL');
                }
              }
              return true;
            },
          },
        },
      ) as CustomModel;

      await model.validate();
      expect(model.valid).toEqual(true);

      model.validateEmails = true;
      await model.validate();
      expect(model.valid).toEqual(false);
    });
  });

  describe('addFields', () => {
    it('should create a model from an object descriptor', async () => {
      type CustomModel = FormModel<{ name: string, lastName: string, email: string }> & {validateEmails: boolean};
      const model = createModelFromState({}) as CustomModel;

      model.addFields({
        // using generic validation
        name: {
          value: 'Snoopy',
          required: 'Name is required',
        },
        // using a custom validation functiont that returns a Boolean
        lastName: {
          value: 'Brown',
          required: 'lastName is required',
          validator: field => field.value !== 'Doe',
          errorMessage: 'Please do not enter Doe',
        },
        email: {
          validator: ({ value = '' }, fields, _model) => {
            if ((_model as CustomModel).validateEmails) {
              if (!(value.indexOf('@') > 1)) {
                throw new Error('INVALID_EMAIL');
              }
            }
            return true;
          },
        },
      });

      await model.validate();
      expect(model.valid).toEqual(true);

      model.validateEmails = true;
      await model.validate();
      expect(model.valid).toEqual(false);
    });

    it('should store non recognized fields as meta in the fields', async () => {
      type StateType = {
        numOfBedrooms: string;
        moveInRange: string;
        comments: string;
      };
      
      const model = createModelFromState({}) as FormModel<StateType>;

      const descriptorFields = [
        {
          name: 'numOfBedrooms',
          value: undefined,
          required: '# of bedrooms is required',
          meta: {
            type: 'Select',
            label: '# of Bedrooms',
            items: [
              { id: 'STUDIO', value: 'Studio' },
              { id: 'ONE_BED', value: 'One bed' },
              { id: 'TWO_BEDS', value: 'Two beds' },
              { id: 'THREE_BEDS', value: 'Three beds' },
              { id: 'FOUR_BEDS', value: 'Four beds' },
            ],
          },
        },
        {
          name: 'moveInRange',
          value: undefined,
          required: 'Move-in range is required',
          meta: {
            type: 'Select',
            label: 'When do you plan to rent?',
            items: [
              { id: 'NEXT_4_WEEKS', value: 'Next 4 weeks' },
              { id: 'NEXT_2_MONTHS', value: 'Next 2 months' },
              { id: 'NEXT_4_MONTHS', value: 'Next 4 months' },
              { id: 'BEYOND_4_MONTHS', value: 'Beyond 4 months' },
              { id: 'I_DONT_KNOW', value: "I don't know" },
            ],
          },
        },
        {
          name: 'comments',
          value: '',
          required: 'Comments are required',
          meta: {
            type: 'TextArea',
            label: 'Comments',
          },
        },
      ];
      
      const descriptors = descriptorFields.reduce((seq, field) => {
        seq[field.name as keyof StateType] = field;
        return seq;
      }, {} as Descriptors<StateType>);

      model.addFields(descriptors);

      const { fields } = model;

      expect(fields.numOfBedrooms.meta).toEqual(descriptors.numOfBedrooms.meta!);
      expect(fields.moveInRange.meta).toEqual(descriptors.moveInRange.meta!);
      expect(fields.comments.meta).toEqual(descriptors.comments.meta!);
      

      await model.validate();
      expect(model.valid).toEqual(false);

      expect(fields.numOfBedrooms.errorMessage).toEqual(descriptors.numOfBedrooms.required as string);
      expect(fields.moveInRange.errorMessage).toEqual(descriptors.moveInRange.required as string);
      expect(fields.comments.errorMessage).toEqual(descriptors.comments.required as string);

      fields.numOfBedrooms.setValue('STUDIO');
      fields.moveInRange.setValue('NEXT_4_WEEKS');
      fields.comments.setValue('Some comment');

      await model.validate();
      expect(model.valid).toEqual(true);
    });
  });
});

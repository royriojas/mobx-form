import { createModel, createModelFromState, FormModel } from '../src/FormModel';
import { deferred, sleep } from '../src/resources/utils';

describe('FormModel', () => {
  describe('A FormModel can be created using createModel, createModelFromState or using the Constructor directly', () => {
    describe('FormModel', () => {
      it('should create a simple form with two fields', () => {
        const model = new FormModel({
          descriptors: { name: {}, lastName: {} },
          initialState: { name: 'Snoopy', lastName: 'Brown' },
        });
        expect(model.fields.name.value).toEqual('Snoopy');
        expect(model.fields.lastName.value).toEqual('Brown');
      });

      it('should create a simple form with three fields', () => {
        const model = new FormModel({
          descriptors: { name: {}, lastName: {}, email: {} },
          initialState: { name: 'Snoopy', lastName: 'Brown', email: 'snoopy@brown.net' },
        });
        expect(model.fields.name.value).toEqual('Snoopy');
        expect(model.fields.lastName.value).toEqual('Brown');
        expect(model.fields.email.value).toEqual('snoopy@brown.net');
      });

      it('can create an empty model', () => {
        const model = new FormModel({});
        expect(Object.keys(model.fields).length).toEqual(0);
      });
    });

    describe('createModel', () => {
      it('should create a simple form with two fields', () => {
        const model = createModel({
          descriptors: { name: {}, lastName: {} },
          initialState: { name: 'Snoopy', lastName: 'Brown' },
        });
        expect(model.fields.name.value).toEqual('Snoopy');
        expect(model.fields.lastName.value).toEqual('Brown');
      });

      it('should create a simple form with three fields', () => {
        const model = createModel({
          descriptors: { name: {}, lastName: {}, email: {} },
          initialState: { name: 'Snoopy', lastName: 'Brown', email: 'snoopy@brown.net' },
        });
        expect(model.fields.name.value).toEqual('Snoopy');
        expect(model.fields.lastName.value).toEqual('Brown');
        expect(model.fields.email.value).toEqual('snoopy@brown.net');
      });

      describe('required fields', () => {
        it('should allow certain fields to marked as required', () => {
          const model = createModel({
            descriptors: {
              name: {
                required: 'The name is required',
              },
              lastName: {},
              email: {
                required: true,
              },
            },
          });

          expect(model.requiredFields).toEqual(['name', 'email']);
        });

        it('should mark fields as required', () => {
          const model = createModel({
            descriptors: {
              name: {
                required: 'The name is required',
              },
              lastName: {},
              email: {
                required: true,
              },
            },
          });

          expect(model.fields.name.required).toEqual(true);
          expect(model.fields.email.required).toEqual(true);
        });

        it('should fail validation if required fields are missing', async () => {
          const model = createModel({
            descriptors: {
              name: {
                required: 'The name is required',
              },
              lastName: {},
              email: {
                required: true,
              },
            },
          });

          await model.validate();
          expect(model.valid).toEqual(false);
        });

        it('a field that is not required can be made required later', () => {
          const model = createModel({
            descriptors: {
              name: {
                required: false,
              },
            },
          });

          expect(model.fields.name.required).toEqual(false);

          model.fields.name.setRequired(true);

          expect(model.fields.name.required).toEqual(true);
        });

        describe('when required fields are missing', () => {
          it('should contain a summary of missing fields', async () => {
            const model = createModel({
              descriptors: {
                name: {
                  required: 'The name is required',
                },
                lastName: {},
                email: {
                  required: true,
                },
              },
            });

            await model.validate();
            expect(model.summary).toMatchSnapshot();
          });

          describe('when required property is set to a message', () => {
            it('should have an errorMessage on failed fields', async () => {
              const model = createModel({
                descriptors: {
                  name: {
                    required: 'The name is required',
                  },
                  lastName: {},
                  email: {
                    required: 'The email is required',
                  },
                },
              });

              await model.validate();

              expect(model.fields.name.errorMessage).toEqual('The name is required');
              expect(model.fields.email.errorMessage).toEqual('The email is required');
            });
          });

          describe('when required property is set to true (boolean)', () => {
            it('should have an errorMessage on failed fields', async () => {
              const model = createModel({
                descriptors: {
                  name: {
                    required: true,
                  },
                  lastName: {},
                  email: {
                    required: true,
                  },
                },
              });

              await model.validate();

              expect(model.fields.name.errorMessage).toMatchSnapshot();
              expect(model.fields.email.errorMessage).toMatchSnapshot();
            });
          });
        });

        it('should pass the validation if required fields are set', async () => {
          const model = createModel({
            descriptors: {
              name: {
                required: 'The name is required',
              },
              lastName: {},
              email: {
                required: true,
              },
            },
          });

          model.fields.name.setValue('Snoopy');
          model.fields.email.setValue('snoopy@brown.org');

          await model.validate();
          expect(model.valid).toEqual(true);
        });

        it('model should inform if required fields are set', async () => {
          const model = createModel({
            descriptors: {
              name: {
                required: 'The name is required',
              },
              lastName: {},
              email: {
                required: true,
              },
            },
          });

          model.fields.name.setValue('Snoopy');
          model.fields.email.setValue('snoopy@brown.org');

          expect(model.requiredAreFilled).toEqual(true);
        });
      });

      describe('interacted', () => {
        it('should be false when the model is created initially', async () => {
          const model = createModel({
            descriptors: {
              name: {
                required: 'The name is required',
              },
              lastName: {},
              email: {
                required: true,
              },
            },
          });

          expect(model.interacted).toEqual(false);
        });

        it('should be true after at least one value is set', async () => {
          const model = createModel({
            descriptors: {
              name: {
                required: 'The name is required',
              },
              lastName: {},
              email: {
                required: true,
              },
            },
          });

          model.fields.name.setValue('Snoopy');

          expect(model.interacted).toEqual(true);
        });

        it('should reset the value of the interacted flag on all fields if the value ', () => {
          const model = createModel({
            descriptors: {
              name: {
                required: 'The name is required',
              },
              lastName: {},
              email: {
                required: true,
              },
            },
          });

          model.fields.name.setValue('Snoopy');

          expect(model.interacted).toEqual(true);

          model.resetInteractedFlag();

          expect(model.interacted).toEqual(false);
        });
      });

      describe('dataIsReady', () => {
        it('should be false when the required data is missing', () => {
          const model = createModel({
            descriptors: {
              name: {
                required: 'The name is required',
              },
              lastName: {},
              email: {
                required: true,
              },
            },
          });

          model.fields.lastName.setValue('Doo');
          expect(model.dataIsReady).toEqual(false);
        });

        it('should be true when the required data is provided', () => {
          const model = createModel({
            descriptors: {
              name: {
                required: 'The name is required',
              },
              lastName: {},
              email: {
                required: true,
              },
            },
          });

          model.fields.name.setValue('Snoopy');
          model.fields.email.setValue('snoopy@doo');

          expect(model.dataIsReady).toEqual(true);
        });

        it('should be true when the required data is provided unless the field is marked as disabled', async () => {
          const model = createModel({
            descriptors: {
              name: {
                required: 'The name is required',
              },
              lastName: {},
              email: {
                required: true,
              },
            },
          });

          model.fields.name.setValue('Snoopy');

          model.disableFields(['email']);

          expect(model.dataIsReady).toEqual(true);
        });

        it('disabled fields will be considered not required', async () => {
          const model = createModel({
            descriptors: {
              name: {
                required: 'The name is required',
              },
              lastName: {},
              email: {
                required: true,
              },
            },
          });

          expect(model.fields.email.required).toEqual(true);

          model.disableFields(['email']);

          expect(model.fields.email.required).toEqual(false);
        });

        it('disabled fields will be considered not required', async () => {
          const model = createModel({
            descriptors: {
              name: {
                required: 'The name is required',
              },
              lastName: {},
              email: {
                required: true,
              },
            },
          });

          expect(model.fields.email.required).toEqual(true);

          model.disableFields(['email']);

          expect(model.fields.email.required).toEqual(false);
        });

        it('disabled fields can also be enabled back again', async () => {
          const model = createModel({
            descriptors: {
              name: {
                required: 'The name is required',
              },
              lastName: {},
              email: {
                required: true,
              },
            },
          });

          expect(model.fields.email.required).toEqual(true);

          model.disableFields(['email']);

          expect(model.fields.email.required).toEqual(false);

          model.enableFields(['email']);

          expect(model.fields.email.required).toEqual(true);
        });

        it('should throw when calling disableFields with no parameters', () => {
          const model = createModel({
            descriptors: {
              name: {
                required: 'The name is required',
              },
              lastName: {},
              email: {
                required: true,
              },
            },
          });

          expect(() => {
            model.disableFields();
          }).toThrowErrorMatchingSnapshot();
        });

        it('should throw when calling disableFields with null', () => {
          const model = createModel({
            descriptors: {
              name: {
                required: 'The name is required',
              },
              lastName: {},
              email: {
                required: true,
              },
            },
          });

          expect(() => {
            model.disableFields(null);
          }).toThrowErrorMatchingSnapshot();
        });

        it('should throw when calling disableFields with an argument different from an array', () => {
          const model = createModel({
            descriptors: {
              name: {
                required: 'The name is required',
              },
              lastName: {},
              email: {
                required: true,
              },
            },
          });

          expect(() => {
            model.disableFields({});
          }).toThrowErrorMatchingSnapshot();
        });

        it('should throw when calling enableFields with an argument different from an array', () => {
          const model = createModel({
            descriptors: {
              name: {
                required: 'The name is required',
              },
              lastName: {},
              email: {
                required: true,
              },
            },
          });

          expect(() => {
            model.enableFields();
          }).toThrowErrorMatchingSnapshot();

          expect(() => {
            model.enableFields({});
          }).toThrowErrorMatchingSnapshot();
        });

        describe('when trying to disable a field that does not exist', () => {
          it('should throw an error', () => {
            const model = createModel({
              descriptors: {
                name: {
                  required: 'The name is required',
                },
                lastName: {},
                email: {
                  required: true,
                },
              },
            });

            expect(() => {
              model.disableFields(['non existant field']);
            }).toThrowErrorMatchingSnapshot();
          });
        });

        it('should be true when the required data is provided unless the validation function fails', async () => {
          const model = createModel({
            descriptors: {
              name: {
                required: 'The name is required',
              },
              lastName: {},
              email: {
                required: true,
                validator: field => {
                  if (field.value.indexOf('@') === -1) {
                    throw new Error('A valid email is required');
                  }
                },
              },
            },
          });

          await model.validate();

          model.fields.name.setValue('Snoopy');
          model.fields.email.setValue('snoopy');

          expect(model.dataIsReady).toEqual(false);
        });
      });
    });

    describe('createModelFromState', () => {
      it('creates a model given only an object with keys and values', () => {
        const model = createModelFromState({ name: 'Snoopy', lastName: 'Brown', email: 'snoopy@brown.net' });
        expect(model.fields.name.value).toEqual('Snoopy');
        expect(model.fields.lastName.value).toEqual('Brown');
        expect(model.fields.email.value).toEqual('snoopy@brown.net');
      });

      it('can also create a model from no state or undefined state', () => {
        const model = createModelFromState();
        expect(Object.keys(model.fields).length).toEqual(0);

        const model1 = createModelFromState(undefined);
        expect(Object.keys(model1.fields).length).toEqual(0);
      });
    });
  });

  describe('Adding fields after model is created', () => {
    it('field can be validated and serialized as other normal fields', async () => {
      const model = createModel({
        descriptors: {
          name: {
            required: 'The name is required',
          },
          lastName: {},
          email: {
            required: true,
          },
        },
      });

      expect(model.requiredFields).toEqual(['name', 'email']);

      expect(model.fields.address).not.toBeDefined();

      model.addFields({
        address: {
          required: true,
        },
      });

      expect(model.requiredFields).toEqual(['name', 'email', 'address']);
      expect(model.fields.address).toBeDefined();

      await model.validate();

      model.fields.address.setValue('1200 Elm street');

      const data = model.serializedData;
      expect(data.address).toEqual('1200 Elm street');
    });

    it('should throw when calling addFields with no values', () => {
      const model = createModel({
        descriptors: {
          name: {
            required: 'The name is required',
          },
          lastName: {},
          email: {
            required: true,
          },
        },
      });

      expect(() => model.addFields()).toThrowErrorMatchingSnapshot();
    });
  });

  describe('while validating model.valid', () => {
    it('should be false', async () => {
      const dfd = deferred();
      const model = createModel({
        descriptors: {
          name: {
            required: 'The name is required',
          },
          lastName: {},
          email: {
            required: true,
            validator: async () => dfd,
          },
        },
      });

      expect(model.valid).toEqual(true);

      model.fields.name.setValue('Snoopy');
      model.fields.email.setValue('snoopy@brown.org');

      model.validate();

      expect(model.valid).toEqual(false);

      dfd.resolve();

      await sleep(50);

      expect(model.valid).toEqual(true);
    });

    describe('restoreInitialValues', () => {
      it('should restore any data to its original values', async () => {
        const dfd = deferred();

        const model = createModel({
          descriptors: {
            name: {
              required: 'The name is required',
            },
            lastName: {},
            email: {
              required: true,
              validator: async () => dfd,
            },
          },
        });

        model.updateFrom({ name: 'snoopy', email: 'snoopy@brown.org' }, { commit: true });

        model.fields.name.setValue('Top cat');
        model.fields.email.setValue('topcat@barbera.org');

        expect(model.serializedData).toEqual({ name: 'Top cat', lastName: undefined, email: 'topcat@barbera.org' });

        model.restoreInitialValues();

        expect(model.serializedData).toEqual({ name: 'snoopy', lastName: undefined, email: 'snoopy@brown.org' });
      });
    });
  });

  describe('validation', () => {
    it('by default fields auto validate themselves', () => {
      const model = createModel({
        descriptors: {
          name: {
            required: '',
          },
        },
      });

      expect(model.fields.name.autoValidate).toEqual(true);
    });

    it('auto validation has to be turned off manually', () => {
      const model = createModel({
        descriptors: {
          name: {
            required: '',
            autoValidate: false,
          },
        },
      });

      expect(model.fields.name.autoValidate).toEqual(false);
    });

    it('by default fields auto validate after any change', async () => {
      const validator = jest.fn();
      const model = createModel({
        descriptors: {
          name: {
            autoValidate: true,
            validator,
          },
        },
      });

      model.fields.name.setValue('some value');

      await sleep(400);

      expect(validator).toHaveBeenCalled();
    });

    it('if autoValidate is false, validate is not called after any change', async () => {
      const validator = jest.fn();
      const model = createModel({
        descriptors: {
          name: {
            autoValidate: false,
            validator,
          },
        },
      });

      model.fields.name.setValue('some value');

      await sleep(400);

      expect(validator).not.toHaveBeenCalled();
    });

    it('a validation function can be async', async () => {
      const model = createModel({
        descriptors: {
          name: {
            validator: async field => {
              await sleep(100);
              return field.value !== 'John';
            },
            errorMessage: 'Please do not use John as name',
          },
        },
      });

      model.fields.name.value = 'John';

      await model.validate();

      expect(model.valid).toEqual(false);
    });

    it('a validation function does not need a default error message. One will be provided if ommited', async () => {
      const model = createModel({
        descriptors: {
          name: {
            validator: async field => {
              await sleep(100);
              return field.value !== 'John';
            },
          },
        },
      });

      model.fields.name.value = 'John';

      await model.validate();

      expect(model.valid).toEqual(false);
      expect(model.fields.name.errorMessage).toEqual('Validation for "name" failed');
    });

    it('If validation function rejected without an error message. One will be provided by default', async () => {
      const model = createModel({
        descriptors: {
          name: {
            validator: field => {
              if (field.value === 'John') return Promise.reject(); // eslint-disable-line prefer-promise-reject-errors
              return true;
            },
          },
        },
      });

      model.fields.name.value = 'John';

      await model.validate();

      expect(model.valid).toEqual(false);
      expect(model.fields.name.errorMessage).toEqual('Validation for "name" failed');
    });

    it('a single field can have multiple validations in an array', async () => {
      const model = createModel({
        descriptors: {
          email: {
            required: 'Email is required',
            validator: [
              field => {
                if (field.value.indexOf('@') === -1) {
                  throw new Error('A valid email is required');
                }
              },
              async field => {
                await sleep(200);
                if (field.value === 'snoopy@brown.org') {
                  return { error: 'Email is taken' };
                }
                return true;
              },
            ],
          },
        },
      });

      model.fields.email.value = '';

      await model.validate();

      expect(model.valid).toEqual(false);
      expect(model.fields.email.errorMessage).toEqual('Email is required');

      model.fields.email.value = 'snoopy';

      await model.validate();

      expect(model.valid).toEqual(false);
      expect(model.fields.email.errorMessage).toEqual('A valid email is required');

      model.fields.email.value = 'snoopy@brown.org';

      await model.validate();

      expect(model.valid).toEqual(false);
      expect(model.fields.email.errorMessage).toEqual('Email is taken');

      model.fields.email.value = 'topcat@barbera.org';

      await model.validate();

      expect(model.valid).toEqual(true);
      expect(model.fields.email.errorMessage).toEqual('');
    });

    it('The validation function can return an error object to describe the error', async () => {
      const model = createModel({
        descriptors: {
          name: {
            validator: field => {
              if (field.value === 'John') {
                return { error: 'Name cannot be John' };
              }
              return true;
            },
          },
        },
      });

      model.fields.name.value = 'John';

      await model.validate();

      expect(model.valid).toEqual(false);
      expect(model.fields.name.errorMessage).toEqual('Name cannot be John');
    });

    describe('If the validator function is an array', () => {
      it('should throw if elements of the array are not functions', async () => {
        const model = createModel({
          descriptors: {
            email: {
              validator: [
                'some string',
                field => {
                  if (field.value.indexOf('@') === -1) {
                    throw new Error('A valid email is required');
                  }
                },
                async field => {
                  await sleep(200);
                  if (field.value === 'snoopy@brown.org') {
                    return { error: 'Email is taken' };
                  }
                  return true;
                },
              ],
            },
          },
        });

        model.fields.email.value = '';

        await model.validate();

        expect(model.valid).toEqual(false);
        expect(model.fields.email.errorMessage).toEqual('Validator must be a function or a function[]');
      });
    });

    describe('if an errorMessage is set in the field', () => {
      it('should report the field as not valid and the entire model is not valid', async () => {
        const model = createModel({
          descriptors: {
            email: {
              autoValidate: false,
              validator: [
                field => {
                  if (field.value.indexOf('@') === -1) {
                    throw new Error('A valid email is required');
                  }
                },
                async field => {
                  await sleep(200);
                  if (field.value === 'snoopy@brown.org') {
                    return { error: 'Email is taken' };
                  }
                  return true;
                },
              ],
            },
          },
        });

        model.fields.email.setErrorMessage('Email is disabled');
        expect(model.valid).toEqual(false);

        model.fields.email.setValue('snoopy@brown.org');

        await model.validate();

        expect(model.valid).toEqual(false);
        expect(model.fields.email.errorMessage).toEqual('Email is taken');

        model.fields.email.setValue('snoopy1@brown.org');
        await model.validate();

        expect(model.valid).toEqual(true);
        expect(model.fields.email.errorMessage).toEqual('');
      });

      it('error message can be cleared from the field and make the form to be considered valid again', async () => {
        const model = createModel({
          descriptors: {
            email: {
              autoValidate: false,
              validator: [
                field => {
                  if (field.value.indexOf('@') === -1) {
                    throw new Error('A valid email is required');
                  }
                },
                async field => {
                  await sleep(200);
                  if (field.value === 'snoopy@brown.org') {
                    return { error: 'Email is taken' };
                  }
                  return true;
                },
              ],
            },
          },
        });

        model.fields.email.setErrorMessage('Email is disabled');
        expect(model.valid).toEqual(false);

        model.fields.email.clearValidation();

        expect(model.valid).toEqual(true);
        expect(model.fields.email.errorMessage).toEqual('');
      });
    });

    describe('field.hasValue function', () => {
      it('should be used to determine if a field has value, useful in case of arrays', () => {
        const model = createModel({
          descriptors: {
            selectedPhone: {
              required: true,
              hasValue: value => !!value && value.length > 0,
            },
          },
        });

        model.fields.selectedPhone.setValue(['some']);
        expect(model.fields.selectedPhone.hasValue).toEqual(true);

        model.fields.selectedPhone.setValue([]);
        expect(model.fields.selectedPhone.hasValue).toEqual(false);
      });
    });

    describe('field.hasValue', () => {
      it('By default arrays are considered as empty if no values are set', () => {
        const model = createModel({
          descriptors: {
            selectedPhone: {
              required: true,
            },
          },
        });

        model.fields.selectedPhone.setValue(['some']);
        expect(model.fields.selectedPhone.hasValue).toEqual(true);

        model.fields.selectedPhone.setValue([]);
        expect(model.fields.selectedPhone.hasValue).toEqual(false);
      });
    });

    it('The validation function can return a rejected promise', async () => {
      const model = createModel({
        descriptors: {
          name: {
            validator: field => {
              if (field.value === 'John') {
                return Promise.reject({ error: 'Name cannot be John' }); // eslint-disable-line prefer-promise-reject-errors
              }
              return Promise.resolve(true);
            },
          },
        },
      });

      model.fields.name.value = 'John';

      await model.validate();

      expect(model.valid).toEqual(false);
      expect(model.fields.name.errorMessage).toEqual('Name cannot be John');
    });

    it('The validation can be async and return the error from the function', async () => {
      const model = createModel({
        descriptors: {
          name: {
            validator: async field => {
              await sleep(100);
              if (field.value === 'John') {
                throw new Error('Name cannot be John');
              }
            },
          },
        },
      });

      model.fields.name.value = 'John';

      await model.validate();

      expect(model.valid).toEqual(false);
      expect(model.fields.name.errorMessage).toEqual('Name cannot be John');
    });

    it('validation is skipped if field is disabled even when using force = true', async () => {
      const validator = jest.fn();
      const model = createModel({
        descriptors: {
          name: {
            autoValidate: false,
            validator,
          },
        },
      });

      model.fields.name.setDisabled(true);

      model.fields.name.validate();

      await sleep(400);

      expect(validator).not.toHaveBeenCalled();

      model.fields.name.validate({ force: true });

      await sleep(400);

      expect(validator).not.toHaveBeenCalled();
    });

    it('validation is skipped the first time if waitForBlur is true', async () => {
      const validator = jest.fn();
      const model = createModel({
        descriptors: {
          name: {
            waitForBlur: true,
            autoValidate: true,
            validator,
          },
        },
      });

      model.fields.name.setValue('Snoopy');

      await sleep(400);

      expect(validator).not.toHaveBeenCalled();

      model.fields.name.markBlurredAndValidate();

      
    });
  });

  describe('serializedData', () => {
    it('creates a model given only an object with keys and values', () => {
      const model = createModelFromState({ name: 'Snoopy', lastName: 'Brown', email: 'snoopy@brown.net' });
      expect(model.serializedData).toEqual({ name: 'Snoopy', lastName: 'Brown', email: 'snoopy@brown.net' });
    });
  });

  describe('fields in a model are not disabled by default', () => {
    it('creates a model given only an object with keys and values', () => {
      const model = createModelFromState({ name: 'Snoopy', lastName: 'Brown', email: 'snoopy@brown.net' });
      expect(model.fields.name.disabled).toEqual(false);
    });
  });
});

# [Mobx](https://www.npmjs.com/package/mobx)-Form

Simple helper for state management

TODO:

- Add more examples
- Add more unit tests
- Add better documentation

## Install

```bash
npm i --save mobx mobx-form
```

## Usage

```javascript
import { createModel } from 'mobx-form';

const model = createModel( {
  // the field descriptor
  // when calling model.validate(); all the validators are executed in parallel
  fieldName1: {
    // whether validation will happen automatically after first update
    autoValidate: true,
    // whether validation should wait until the field is blurred at least once
    // (meaning the blur event happened at least once in that field).
    //
    // This requires that the component calls `markBlurredAndValidate()` after
    // the blur even is raised on the field
    waitForBlur: false,
    // Very useful flag to just make a field required or not without requiring a validator
    // the `required` property can be:
    // - a boolean, in which case the error message shown will be `Required`
    // - a `string` in which case the string message will be used as the message to show when the field has no value
    required: 'This field is required',
    // optional, default error message is the validaor function return just true/false
    errorMessage:
    // optional, if `required` is defined. Required if not
    // the validation function it receive the current field and allFields for
    // validations that need to take in consideration more than one in conjuction
    //
    // - if validation passes function must return true.
    // - if validation does not pass the function should:
    //   - return false (default errorMessage specified in the validator will be used)
    //   - throw an error (error.message is going to be used as the errorMessage)
    //   - reject or return an object with an error field. like:
    //     ```
    //     return { error: 'some error' };
    //     return Promise.reject({ error: 'some error' }); // although this should be considered deprecated
    //     ```.
    validator = (field, allFields, model) => {
      // do validation
      // return true/false
      // throw new Error('some error');
      // return { error: 'some error '};
    }
  }
})

performValidation = async () => {
  // To call all validators
  await model.validate();

  // To check if valid (after awaiting the validate call)
  if (model.valid) {
    // get the serialized data
    // { fieldName: 'value set' }
    const obj = model.serializedData;

    // do something with the serializedData
    await xhr('/some/endpoint', { method: 'post', payload: obj });
  };
};


// to update values in the form.
model.updateFrom({ fieldName1: 'new value' }, /* reset = true */); // by default setting values using this method
                                                                   // will reset the interacted flag on the Field
                                                                   // and reset the validation error
```

## Example:

```js
import trim from 'jq-trim';
import { createModel } from 'mobx-form';

const model = createModel({
  descriptors: {
    name: {
      required: 'Name is required',
    },
    // validator for email
    email: {
      // validator function
      async validator(field) {
        const email = trim(field.value);
        // super simple and naive email validation
        if (!email || !(email.indexOf('@') > 0)) {
          throw new Error('Please provide an error message');
        }
      },
    },
    // validator for password
    password: {
      // validator function
      async validator(field) {
        if (!trim(field.value)) {
          throw new Error('Please provide your password');
        }
      },
    },
  },
  initialState: {
    email: '',
    password: '',
  },
});

const main = async () => {
  await model.validate();

  console.log('>>>> model.valid', model.valid);
  console.log('>>>> model.summary', model.summary);
  console.log('>>>> model.requiredFields', model.requiredFields);

  // >>>> model.valid false
  // >>>> model.summary [ 'Name is required',
  //   'Please provide an error message',
  //   'Please provide your password' ]
  // >>>> model.requiredFields [ 'name' ]
};

main().catch(err => console.error('>>> error', err));
```
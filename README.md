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

const model = createModel({
  // the fields that will hold the initial data
  fieldName: '',
}, {
  // the validators by fieldName.
  // when calling model.validate(); all the validators are executed sequentially
  fieldName: {
    // whether validation will happen after first update. Default true.
    // sometimes is annoying
    interactive: true,
    // whether validation should wait until the field is blurred at least once
    // (meaning the blur event happened at least once in that field). The main
    // limitation here is that `onBlur` of the field is required to call the method
    // `markBlurredAndValidate();`
    waitForBlur: false,
    // if this prop has no value validation will fail with an error message
    // equal to the prop's value
    // if `required` is set. `fn` is optional.
    required: 'This field is required',
    // optional, default error message is the function return just true/false
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
    fn(field/*, allFields*/) {
      // do validation
      // return true/false
      // throw new Error('some error');
      // return Promise.reject({ error: 'some error '}).
    }
  }
})

// To call all validations
await model.validate();

// To check if valid (after awaiting the validate call)
if (model.valid) {
  // get the serialized data
  // { fieldName: 'value set' }
  const obj = model.serializedData;
};

// To reset the initial values
model.restoreInitialValues();

// To reset the validation
model.clearValidations();

// To get the summary of all the errors
model.summary // Array or error messages

// To know if the model was interacted
model.interacted // true if at least one field has a value set

// To know if all required fields have values
model.requiredAreFilled // true if all fields marked as required are filled

// To know if the data is ready to serialize
model.dataIsReady // true if interacted, requiredAreFilled and valid are true.

// to know which fields are required
model.requiredFields // an array with the required fieldNames

// to update values in the form
// by default setting values using this method will reset the interacted flag on the Field and reset the validation error
model.updateFrom({ fieldName: 'new value' }, /* reset = true */);
```

## Example:

```js
import { createModel } from 'mobx-form';

const model = this.model = createModel({
  email: '', // initial value for email
  password: '', // initial value for password
}, {
  // validator for email
  email: {
    interactive: false,
    // validator function
    fn(field) {
      const email = trim(field.value);
      // super simple and naive email validation
      if (!email || !(email.indexOf('@') > 0)) {
        return Promise.reject({
          error: 'Please provide an error message'
        });
      }
    },
  },
  // validator for password
  password: {
    interactive: false,
    // validator function
    fn(field) {
      if (!trim(field.value)) {
        return Promise.reject({
          error: 'Please provide your password'
        });
      }
    },
  },
});
```
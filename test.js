import trim from 'jq-trim';
import { createModel } from './src/FormModel';

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
};

main().catch(err => console.error('>>> error', err));

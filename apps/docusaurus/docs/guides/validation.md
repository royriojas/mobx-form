---
sidebar_position: 2
title: Validation
---

# Validation

`mobx-form` supports multiple validation patterns: required fields, synchronous validators, asynchronous validators, multiple validators per field, and cross-field validation.

## Required Fields

Mark a field as required with a boolean or a custom error message:

```typescript
const form = createModel({
  descriptors: {
    name: {
      required: 'Please enter your name',  // custom message
    },
    email: {
      required: true,  // uses default: 'Field: "email" is required'
    },
  },
  initialState: { name: '', email: '' },
});
```

When a required field has no value (empty string, `null`, `undefined`, or empty array), validation fails with the specified message.

## Synchronous Validators

Return `{ error: string }` to indicate failure, or return nothing / `true` for success:

```typescript
const form = createModel({
  descriptors: {
    age: {
      validator: ({ value }) => {
        const num = parseInt(value, 10);
        if (isNaN(num) || num < 0 || num > 150) {
          return { error: 'Please enter a valid age (0-150)' };
        }
      },
    },
  },
  initialState: { age: '' },
});
```

## Asynchronous Validators

Validators can be `async` functions. The field and model expose a `validating` flag you can use for loading states:

```typescript
const form = createModel({
  descriptors: {
    username: {
      required: 'Username is required',
      validator: async ({ value }) => {
        const response = await fetch(`/api/check-username?u=${value}`);
        const { available } = await response.json();
        if (!available) {
          throw new Error('Username is already taken');
        }
      },
    },
  },
  initialState: { username: '' },
});

// In your component:
// form.fields.username.validating → true while checking
// form.validating → true if any field is validating
```

:::tip
`mobx-form` automatically handles **stale validations**. If the user types quickly, only the most recent validation result is applied. Earlier in-flight validations are ignored.
:::

## Multiple Validators per Field

Pass an array of validator functions. They run sequentially — if one fails, subsequent validators still run:

```typescript
const form = createModel({
  descriptors: {
    password: {
      required: 'Password is required',
      validator: [
        ({ value }) => {
          if (value.length < 8) {
            return { error: 'Must be at least 8 characters' };
          }
        },
        ({ value }) => {
          if (!/[A-Z]/.test(value)) {
            return { error: 'Must contain an uppercase letter' };
          }
        },
        ({ value }) => {
          if (!/[0-9]/.test(value)) {
            return { error: 'Must contain a number' };
          }
        },
      ],
    },
  },
  initialState: { password: '' },
});
```

## Cross-Field Validation

Validators receive the full `fields` object and `model`, allowing cross-field checks:

```typescript
const form = createModel({
  descriptors: {
    password: {
      required: 'Password is required',
    },
    confirmPassword: {
      required: 'Please confirm your password',
      validator: ({ value, fields }) => {
        if (value !== fields.password.value) {
          return { error: 'Passwords do not match' };
        }
      },
    },
  },
  initialState: { password: '', confirmPassword: '' },
});
```

The validator function signature is:

```typescript
type ValidateFn<T, K> = (args: {
  value: T;                    // current field value
  field: Field<T, K>;          // the field being validated
  fields: FormModel<K>['fields']; // all fields in the model
  model: FormModel<K>;         // the full model
}) => Promise<ValidatorResult> | ValidatorResult;
```

## Validation Timing

### Auto-Validate (default)

By default, `autoValidate` is `true` — validation runs after each value change, debounced by 300ms:

```typescript
username: {
  autoValidate: true,  // default
  validationDebounceThreshold: 500,  // customize debounce (ms)
}
```

### Wait for Blur

Use `waitForBlur` to defer validation until the user leaves the field. This prevents errors from appearing while the user is still typing:

```typescript
email: {
  waitForBlur: true,
  validator: ({ value }) => {
    if (!value.includes('@')) {
      return { error: 'Invalid email' };
    }
  },
}
```

Call `field.markBlurredAndValidate()` in your `onBlur` handler to trigger validation.

### Manual Validation

Disable auto-validation entirely and validate on form submission:

```typescript
name: {
  autoValidate: false,
  required: 'Name is required',
}

// Later, validate everything at once:
await form.validate();
```

### Clear Error on Value Change

Immediately clear the error when the user starts typing, without waiting for debounced re-validation:

```typescript
email: {
  clearErrorOnValueChange: true,
  validator: ({ value }) => { /* ... */ },
}
```

## Error Handling Patterns

Validators can signal errors in several ways:

```typescript
// 1. Return an error object
validator: ({ value }) => {
  return { error: 'Something went wrong' };
}

// 2. Throw an Error
validator: ({ value }) => {
  throw new Error('Something went wrong');
}

// 3. Return false (uses default error message)
validator: ({ value }) => {
  return false;
}

// 4. Return a rejected promise
validator: ({ value }) => {
  return Promise.reject(new Error('Something went wrong'));
}
```

## Setting Errors Manually

You can set errors on fields programmatically, for example after a server-side validation response:

```typescript
// Set an error message
form.fields.email.setErrorMessage('This email is already in use');

// Set a raw error object
form.fields.email.setError({ message: 'Server error' });

// Clear the error
form.fields.email.resetError();
```

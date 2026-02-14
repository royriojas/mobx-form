
# mobx-form

[![NPM Version](https://img.shields.io/npm/v/mobx-form.svg)](https://www.npmjs.com/package/mobx-form)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/royriojas/mobx-form/actions/workflows/ci.yml/badge.svg)](https://github.com/royriojas/mobx-form/actions/workflows/ci.yml)

> A simple, robust, and extensible form state management helper for [MobX](https://github.com/mobxjs/mobx).


`mobx-form` simplifies form validation and state management in MobX-powered React applications. It provides a declarative way to define form models with synchronous and asynchronous validation, dirty tracking, and easy data serialization.

[**View Live Demo / Storybook**](https://royriojas.github.io/mobx-form/)

## Features

- ** declarative form definition**: Define your form structure with simple descriptors.
- **⚡️ Reactive**: Built on MobX for high-performance, fine-grained reactivity.
- **✅ Validation**:
  - Sync and Async validators
  - Multiple validators per field
  - Cross-field validation (e.g., password confirmation)
  - Custom error messages
- **🔍 State Tracking**:
  - `dirty` state (modified vs initial)
  - `interacted` state (touched)
  - `validating` state (async loading indicators)
- **🛠 Utilities**:
  - `serializedData` for easy API payloads
  - `commit()` / `restoreInitialValues()` for transaction-like behavior
  - `autoValidate` options

## Demo / Storybook

This project includes a comprehensive Storybook suite demonstrating all features.

To run the interactive stories locally:

```bash
# Install dependencies
npm install

# Run Storybook
npm run storybook
```

[**View Live Demo**](https://royriojas.github.io/mobx-form/)

Navigate to `http://localhost:6006` to explore examples like:
- Simple Login Forms
- Async Validation (simulated API checks)
- Dynamic Fields
- Complex Validation Rules

## Installation

```bash
npm install --save mobx-form mobx
# or
bun add mobx-form mobx
```

> Note: `mobx` is a peer dependency.

## Usage

### 1. Create a Form Model

```typescript
import { createModel } from 'mobx-form';

const loginForm = createModel({
  initialState: {
    username: '',
    password: ''
  },
  descriptors: {
    username: {
      required: 'Username is required',
      autoValidate: true
    },
    password: {
      required: true, // uses default required message
      validator: (field) => {
        if (field.value.length < 6) {
          return { error: 'Password must be at least 6 characters' };
        }
      }
    }
  }
});
```

### 2. Connect to React

Use `observer` from `mobx-react-lite` to make your component reactive.

```tsx
import React from 'react';
import { observer } from 'mobx-react-lite';

const LoginForm = observer(({ model }) => {
  return (
    <form onSubmit={(e) => { e.preventDefault(); model.validate(); }}>
      
      {/* Username Field */}
      <div>
        <label>Username</label>
        <input 
          value={model.fields.username.value}
          onChange={e => model.fields.username.setValue(e.target.value)}
          onBlur={() => model.fields.username.markBlurredAndValidate()}
        />
        <div className="error">{model.fields.username.error}</div>
      </div>

      {/* Password Field */}
      <div>
        <label>Password</label>
        <input 
          type="password"
          value={model.fields.password.value}
          onChange={e => model.fields.password.setValue(e.target.value)}
        />
        <div className="error">{model.fields.password.error}</div>
      </div>

      {/* Actions */}
      <button type="submit" disabled={model.validating}>
        {model.validating ? 'Checking...' : 'Login'}
      </button>

      {/* Form Status */}
      <div>
        Valid: {model.valid ? 'Yes' : 'No'} | 
        Dirty: {model.dirty ? 'Yes' : 'No'}
      </div>
    </form>
  );
});
```

## API Reference

### `createModel(config)`

Creates a new `FormModel` instance.

**Config Object:**
- `initialState`: Object containing initial values for fields.
- `descriptors`: Object definition validation rules and behavior for each field.
- `options`: `{ throwIfMissingField: boolean }` (default `true`).

### Field Descriptor Properties

| Property | Type | Description |
|----------|------|-------------|
| `required` | `boolean \| string` | Marks field as required. String serves as the error message. |
| `validator` | `Function \| Function[]` | Validation function(s). Return `true`, `{error: msg}`, or throw/return Error. |
| `autoValidate` | `boolean` | If `true`, validation runs on every change (default behavior). |
| `waitForBlur` | `boolean` | If `true`, validation is deferred until the field is blurred once. |
| `value` | `any` | Initial value (can also be set via `initialState`). |
| `disabled` | `boolean` | If `true`, field is skipped during validation. |
| `meta` | `object` | Arbitrary metadata (e.g., placeholder text, options list). |
| `clearErrorOnValueChange` | `boolean` | Immediately clears error when user types. |

### `FormModel` Methods & Properties

- **`model.fields`**: Access to individual field objects (e.g., `model.fields.email`).
- **`model.validate()`**: Triggers validation for all fields. Returns a Promise.
- **`model.valid`**: Boolean. `true` if all fields are valid.
- **`model.dirty`**: Boolean. `true` if any field value differs from initial state.
- **`model.serializedData`**: Returns a plain JS object with current values (trimmed strings).
- **`model.commit()`**: Sets current values as the new "initial" state (resets `dirty` to false).
- **`model.restoreInitialValues()`**: Resets all fields to their last committed values.
- **`model.addFields(descriptors)`**: Dynamically add new fields to the form.

## Advanced Examples

### Async Validation
Validators can be async functions. Use the `model.validating` or `field.validating` flags to show loaders.

```typescript
username: {
  validator: async (field) => {
    const isTaken = await checkApiForUser(field.value);
    if (isTaken) throw new Error('Username already taken');
  }
}
```

### Cross-Field Validation
Access other fields via the `model` argument in validators.

```typescript
confirmPassword: {
  validator: (field, allFields, model) => {
    if (field.value !== model.fields.password.value) {
      return { error: 'Passwords do not match' };
    }
  }
}
```

## License

MIT
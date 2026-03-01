---
sidebar_position: 1
title: Basic Usage
---

# Basic Usage

This guide walks through creating a form, connecting it to React, and handling submissions.

## Creating a Form Model

Use `createModel` to define a form with typed fields:

```typescript
import { createModel } from 'mobx-form';

type ContactForm = {
  name: string;
  email: string;
  message: string;
};

const form = createModel<ContactForm>({
  descriptors: {
    name: {
      required: 'Name is required',
    },
    email: {
      required: 'Email is required',
      validator: ({ value }) => {
        if (!value.includes('@')) {
          return { error: 'Please enter a valid email' };
        }
      },
    },
    message: {},
  },
  initialState: {
    name: '',
    email: '',
    message: '',
  },
});
```

## Accessing Field Values

Each field is available on `model.fields`:

```typescript
form.fields.name.value;       // ''
form.fields.name.error;       // undefined (not validated yet)
form.fields.name.dirty;       // false
form.fields.name.interacted;  // false
```

## Setting Values

```typescript
// Direct setter
form.fields.name.value = 'John';

// Method call (with options)
form.fields.name.setValue('John');

// With options — useful for programmatic updates
form.fields.name.setValue('John', { resetInteractedFlag: true });
```

## Validation

```typescript
// Validate all fields
await form.validate();

// Check results
console.log(form.valid);   // true/false
console.log(form.summary); // ['Email is required'] — array of error messages
```

## Reading Data

When ready to submit, use `serializedData`. It returns a plain JS object with trimmed string values:

```typescript
await form.validate();

if (form.valid) {
  const data = form.serializedData;
  // { name: 'John', email: 'john@example.com', message: 'Hello' }
  await submitToApi(data);
}
```

## Connecting to React

Wrap your component with `observer` from `mobx-react-lite`:

```tsx
import { observer } from 'mobx-react-lite';

const ContactFormView = observer(({ form }) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await form.validate();
    if (form.valid) {
      console.log('Submit:', form.serializedData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label>
        <input
          value={form.fields.name.value}
          onChange={(e) => form.fields.name.setValue(e.target.value)}
          onBlur={() => form.fields.name.markBlurredAndValidate()}
        />
        {form.fields.name.error && (
          <span className="error">{form.fields.name.error}</span>
        )}
      </div>

      <div>
        <label>Email</label>
        <input
          value={form.fields.email.value}
          onChange={(e) => form.fields.email.setValue(e.target.value)}
          onBlur={() => form.fields.email.markBlurredAndValidate()}
        />
        {form.fields.email.error && (
          <span className="error">{form.fields.email.error}</span>
        )}
      </div>

      <div>
        <label>Message</label>
        <textarea
          value={form.fields.message.value}
          onChange={(e) => form.fields.message.setValue(e.target.value)}
        />
      </div>

      <button type="submit" disabled={form.validating}>
        {form.validating ? 'Checking...' : 'Submit'}
      </button>
    </form>
  );
});
```

## Key Concepts

| Concept | Description |
|---------|-------------|
| **`required`** | Marks a field as required. Pass a string to customize the error message. |
| **`autoValidate`** | When `true` (default), triggers validation after each value change. |
| **`waitForBlur`** | Defers validation until the field is blurred for the first time. |
| **`markBlurredAndValidate()`** | Call on `onBlur` — marks the field as blurred and runs validation. |
| **`dirty`** | `true` if the current value differs from the initial value. |
| **`interacted`** | `true` if the user has set a value on this field. |

## Next Steps

- [**Validation**](./validation) — Sync, async, and cross-field validation
- [**React Hooks**](./react-hooks) — Recommended patterns with hooks
- [**Field Wrappers**](./field-wrappers) — Reusable field components

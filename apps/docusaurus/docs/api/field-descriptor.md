---
sidebar_position: 4
title: FieldDescriptor
---

# FieldDescriptor

A `FieldDescriptor` defines the behavior of a single field within a form model. Descriptors are passed to `createModel` in the `descriptors` object.

## Interface

```typescript
interface FieldDescriptor<T, K> {
  value?: T;
  required?: boolean | string;
  validator?: ValidateFn<T, K> | ValidateFn<T, K>[];
  autoValidate?: boolean;
  waitForBlur?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  clearErrorOnValueChange?: boolean;
  validationDebounceThreshold?: number;
  hasValue?: (value: T) => boolean;
  meta?: Record<string, any>;
}
```

## Properties

### `value`

```typescript
value?: T
```

Initial value for the field. Can also be provided via `initialState` in `createModel`.

### `required`

```typescript
required?: boolean | string
```

Marks the field as required.

- `true` — uses default message: `Field: "fieldName" is required`
- `'Custom message'` — uses the provided string as the error message

Required validation runs **before** custom validators.

### `validator`

```typescript
validator?: ValidateFn<T, K> | ValidateFn<T, K>[]
```

Validation function(s) for the field. Can be:
- A single function
- An array of functions (runs sequentially)
- Sync or async

See [Validation Guide](../guides/validation) for detailed examples.

### `autoValidate`

```typescript
autoValidate?: boolean  // default: true
```

When `true`, validation runs automatically after each value change (debounced).

### `waitForBlur`

```typescript
waitForBlur?: boolean  // default: false
```

When `true`, validation is deferred until `markBlurredAndValidate()` is called (typically on `onBlur`).

### `disabled`

```typescript
disabled?: boolean  // default: false
```

When `true`, the field is disabled:
- Skipped during validation
- `required` returns `false`

### `errorMessage`

```typescript
errorMessage?: string
```

Default error message when a validator returns `false` (without a specific message).

### `clearErrorOnValueChange`

```typescript
clearErrorOnValueChange?: boolean  // default: false
```

When `true`, the error is immediately cleared when the user changes the value, without waiting for debounced re-validation. Provides faster visual feedback.

### `validationDebounceThreshold`

```typescript
validationDebounceThreshold?: number  // default: 300 (ms)
```

How long to debounce auto-validation after value changes. Only applies when `autoValidate` is `true`.

### `hasValue`

```typescript
hasValue?: (value: T) => boolean
```

Custom function to determine if the field "has a value". Used by the `required` check.

**Default behavior:**
- Arrays: `value.length > 0`
- Scalars: not `null`, `undefined`, or `""`

### `meta`

```typescript
meta?: Record<string, any>
```

Arbitrary metadata stored on the field. Useful for UI hints like placeholder text, dropdown options, or layout preferences.

```typescript
email: {
  required: true,
  meta: {
    placeholder: 'Enter your email',
    icon: 'mail',
    order: 1,
  },
}

// Access later:
form.fields.email.meta?.placeholder; // 'Enter your email'
```

---

## Full Example

```typescript
const form = createModel<SignupForm>({
  descriptors: {
    username: {
      required: 'Username is required',
      autoValidate: true,
      validationDebounceThreshold: 500,
      validator: async ({ value }) => {
        const taken = await checkUsernameTaken(value);
        if (taken) throw new Error('Username is taken');
      },
    },
    email: {
      required: 'Email is required',
      waitForBlur: true,
      clearErrorOnValueChange: true,
      validator: ({ value }) => {
        if (!value.includes('@')) {
          return { error: 'Invalid email address' };
        }
      },
    },
    role: {
      value: 'user',
      meta: {
        options: ['user', 'admin', 'editor'],
      },
    },
    tags: {
      value: [],
      required: 'Select at least one tag',
      hasValue: (v) => Array.isArray(v) && v.length > 0,
    },
    notes: {
      disabled: true,  // initially hidden/disabled
    },
  },
  initialState: {
    username: '',
    email: '',
    role: 'user',
    tags: [],
    notes: '',
  },
});
```

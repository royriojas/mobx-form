---
sidebar_position: 5
title: Advanced Patterns
---

# Advanced Patterns

This guide covers advanced use cases: dynamic fields, programmatic updates, disabling/enabling fields, dirty tracking, and form lifecycle management.

## Dynamic Fields

Add fields to a form at runtime using `addFields()`:

```typescript
const form = createModel({
  descriptors: {
    name: { required: 'Name is required' },
  },
  initialState: { name: '' },
});

// Later, add a new field dynamically
form.addFields({
  phone: {
    required: 'Phone is required',
    value: '',
  },
});

// The new field is immediately available
form.fields.phone.setValue('+1 555-0100');
```

:::note
Dynamically added fields don't benefit from TypeScript type inference unless you update the generic type parameter manually.
:::

## Disabling / Enabling Fields

Disabled fields are **skipped during validation** and their `required` property returns `false`:

```typescript
// Disable fields
form.disableFields(['phone', 'address']);

// Enable them back
form.enableFields(['phone', 'address']);

// Check individual field
form.fields.phone.disabled; // true/false
```

This is useful for multi-step forms or conditional fields.

## Dirty Tracking

`mobx-form` tracks whether field values have changed from their initial values:

```typescript
// per-field
form.fields.name.dirty;   // true if value !== initialValue

// model-level
form.dirty;   // true if ANY field is dirty
```

### Commit & Restore

```typescript
// Accept current values as the new "initial" state
form.commit();
// After commit: form.dirty === false

// Revert all fields back to their committed values
form.restoreInitialValues();
```

This enables **transaction-like** behavior — make changes, then commit or rollback.

## Updating From External Data

Load data (e.g., from an API) into the form:

```typescript
const userData = await fetchUser(userId);

// Updates matching fields, resets interacted flags, and commits
form.updateFrom(userData);
// After updateFrom: form.dirty === false, form.interacted === false
```

Options:

```typescript
form.updateFrom(data, {
  resetInteractedFlag: true,   // default: true
  commit: true,                // default: false
  throwIfMissingField: false,  // default: true — set false to ignore unknown keys
});
```

## Form Readiness

`dataIsReady` combines multiple checks into a single convenient property:

```typescript
form.dataIsReady;
// true when: interacted && requiredAreFilled && valid
```

Useful for enabling/disabling submit buttons without running validation:

```tsx
<button disabled={!form.dataIsReady || form.validating}>
  Submit
</button>
```

## Programmatic Error Setting

Set server-side validation errors after a failed API call:

```typescript
try {
  await api.createUser(form.serializedData);
} catch (err) {
  if (err.field === 'email') {
    form.fields.email.setErrorMessage('This email is already registered');
  }
}
```

## Reset Patterns

```typescript
// Reset all fields to initial values
form.restoreInitialValues();

// Reset interacted flags only (keep values)
form.resetInteractedFlag();

// Reset validation-once tracking
form.resetValidatedOnce();

// Clear validation errors without resetting values
form.fields.name.clearValidation();
```

## Validation State Tracking

```typescript
// Has validation ever been run on all fields?
form.validatedAtLeastOnce;  // boolean

// Is any field currently being validated (async)?
form.validating;  // boolean

// Per-field validation tracking
form.fields.email.validating;          // currently validating
form.fields.email.validatedAtLeastOnce;  // has been validated at least once
form.fields.email.blurred;             // user has blurred this field
```

## Custom `hasValue` Logic

For fields with non-standard "empty" checks (e.g., arrays, objects):

```typescript
const form = createModel({
  descriptors: {
    tags: {
      required: 'Select at least one tag',
      value: [],
      hasValue: (value) => Array.isArray(value) && value.length > 0,
    },
  },
  initialState: {},
});
```

By default, `mobx-form` considers arrays empty if `length === 0`, and scalars empty if `null`, `undefined`, or `""`.

## Debounced Validation

Control the debounce threshold for auto-validation:

```typescript
username: {
  autoValidate: true,
  validationDebounceThreshold: 500,  // ms, default is 300
  validator: async ({ value }) => {
    const available = await checkUsername(value);
    if (!available) throw new Error('Taken');
  },
}
```

## Using `createModelFromState`

For quickly creating a form from a plain state object without explicit descriptors:

```typescript
import { createModelFromState } from 'mobx-form';

// Creates a model with fields for each key, no validation
const form = createModelFromState({ name: 'John', age: 30 });

// Or with partial descriptors
const form2 = createModelFromState(
  { name: '', email: '' },
  { name: { required: 'Required' } },
);
```

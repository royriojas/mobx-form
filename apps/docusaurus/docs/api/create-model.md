---
sidebar_position: 1
title: createModel
---

# createModel

The primary way to create a form model instance.

## Signature

```typescript
function createModel<T>(args: FormModelArgs<T>): FormModel<T>
```

## Parameters

### `FormModelArgs<T>`

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `descriptors` | `Partial<Descriptors<T>>` | Yes | Field definitions with validation rules |
| `initialState` | `Partial<T>` | No | Initial values for the fields |
| `options` | `{ throwIfMissingField?: boolean }` | No | If `true` (default), throws when `updateFrom` encounters unknown keys |

## Returns

A `FormModel<T>` instance with typed `fields`, validation methods, and data serialization.

## Usage

### Basic

```typescript
import { createModel } from 'mobx-form';

const form = createModel({
  descriptors: {
    name: { required: 'Name is required' },
    email: { required: 'Email is required' },
  },
  initialState: {
    name: '',
    email: '',
  },
});
```

### With TypeScript Generics

```typescript
type ProfileForm = {
  name: string;
  bio: string;
  age: number;
};

const form = createModel<ProfileForm>({
  descriptors: {
    name: { required: 'Required' },
    bio: {},
    age: {
      validator: ({ value }) => {
        if (value < 0) return { error: 'Age must be positive' };
      },
    },
  },
  initialState: { name: '', bio: '', age: 0 },
});

// TypeScript knows:
form.fields.name;  // Field<string, ProfileForm>
form.fields.age;   // Field<number, ProfileForm>
form.serializedData; // ProfileForm
```

### Without Initial State

Provide `value` in individual descriptors instead:

```typescript
const form = createModel({
  descriptors: {
    name: { value: '', required: 'Required' },
    terms: { value: false },
  },
});
```

---

## `createModelFromState`

A convenience function for quickly creating a model from a plain state object.

### Signature

```typescript
function createModelFromState<T>(
  initialState?: Partial<T>,
  validators?: Descriptors<T>,
  options?: { throwIfMissingField?: boolean },
): FormModel<T>
```

### Usage

```typescript
import { createModelFromState } from 'mobx-form';

// No validation — just reactive fields
const form = createModelFromState({
  name: 'John',
  email: 'john@example.com',
});

// With partial validation
const form2 = createModelFromState(
  { name: '', email: '' },
  { name: { required: 'Name is required' } },
);
```

This merges the keys from `initialState` and `validators` to create complete descriptors, then delegates to `createModel`.

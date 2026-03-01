---
sidebar_position: 5
title: Types
---

# Types

All TypeScript types exported by `mobx-form`.

## Core Types

### `FormModelArgs<T>`

Arguments for `createModel()`:

```typescript
type FormModelArgs<T> = {
  descriptors: Partial<Descriptors<T>>;
  initialState?: Partial<T>;
  options?: ThrowIfMissingFieldType;
};
```

### `Descriptors<T>`

Maps field names to their descriptors:

```typescript
type Descriptors<T> = {
  [P in keyof T]: FieldDescriptor<T[P], T>;
};
```

### `FieldDescriptor<T, K>`

See [FieldDescriptor API](./field-descriptor) for full documentation.

```typescript
interface FieldDescriptor<T, K> {
  waitForBlur?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  validator?: ValidateFn<T, K> | ValidateFn<T, K>[];
  hasValue?: (value: T) => boolean;
  value?: T;
  required?: boolean | string;
  autoValidate?: boolean;
  validationDebounceThreshold?: number;
  clearErrorOnValueChange?: boolean;
  meta?: Record<string, any>;
}
```

---

## Validator Types

### `ValidateFn<T, K>`

The validator function signature:

```typescript
type ValidateFn<T, K> = (
  args: ValidateFnArgs<T, K>,
) => Promise<ValidatorResult> | ValidatorResult;
```

### `ValidateFnArgs<T, K>`

Arguments passed to every validator:

```typescript
type ValidateFnArgs<T, K> = {
  field: Field<T, K>;
  fields: FormModel<K>['fields'];
  model: FormModel<K>;
  value: Field<T, K>['value'];
};
```

### `ValidatorResult`

What a validator can return:

```typescript
type ValidatorResult = boolean | ResultObj | void;
```

- `true` or `void` — field is valid
- `false` — field is invalid (uses default error message)
- `{ error: string }` — field is invalid with a specific message
- Alternatively, `throw new Error('message')` or return a rejected Promise

### `ResultObj`

```typescript
type ResultObj = { error: string };
```

### `ErrorLike`

```typescript
type ErrorLike = { message: string } | Error;
```

---

## Option Types

### `SetValueFnArgs`

Options for `setValue()` and related methods:

```typescript
type SetValueFnArgs = {
  resetInteractedFlag?: boolean;
} & CommitType;
```

### `CommitType`

```typescript
type CommitType = {
  commit?: boolean;
};
```

### `ForceType`

```typescript
type ForceType = {
  force?: boolean;
};
```

### `ThrowIfMissingFieldType`

```typescript
type ThrowIfMissingFieldType = {
  throwIfMissingField?: boolean;
};
```

### `ResetInteractedFlagType`

```typescript
type ResetInteractedFlagType = {
  resetInteractedFlag?: boolean;
};
```

---

## Exported Values

| Export | Type | Description |
|--------|------|-------------|
| `createModel` | Function | Creates a `FormModel` instance |
| `createModelFromState` | Function | Creates a `FormModel` from a plain state object |
| `FormModel` | Class | The form model class |
| `Field` | Class | The field class |

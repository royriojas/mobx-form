---
sidebar_position: 2
title: FormModel
---

# FormModel

The `FormModel` class manages a collection of fields, their validation, and the overall form state.

You typically don't instantiate `FormModel` directly — use [`createModel()`](./create-model) instead.

## Properties

### `fields`

```typescript
fields: { [P in keyof K]: Field<K[P], K> }
```

Object containing all field instances, keyed by field name.

```typescript
form.fields.email.value;   // access a field
form.fields.email.error;   // get validation error
```

### `valid`

```typescript
get valid(): boolean
```

`true` if **all** fields are valid and no validation is in progress. Returns `false` while any async validator is running.

### `dirty`

```typescript
get dirty(): boolean
```

`true` if **any** field's current value differs from its initial (committed) value.

### `interacted`

```typescript
get interacted(): boolean
```

`true` if the user has set a value on **any** field.

### `validating`

```typescript
get validating(): boolean
```

`true` if **any** field is currently running an async validator, or if a model-level validation is in progress.

### `validatedAtLeastOnce`

```typescript
get validatedAtLeastOnce(): boolean
```

`true` if **all** fields have been validated at least once.

### `dataIsReady`

```typescript
get dataIsReady(): boolean
```

Convenience property. `true` when `interacted && requiredAreFilled && valid`.

### `requiredAreFilled`

```typescript
get requiredAreFilled(): boolean
```

`true` if all required fields have a value (doesn't run validators, just checks `.hasValue`).

### `requiredFields`

```typescript
get requiredFields(): (keyof K)[]
```

Array of field keys that are currently marked as required (excludes disabled fields).

### `serializedData`

```typescript
get serializedData(): K
```

Returns a plain JavaScript object with current field values. String values are **trimmed** automatically.

```typescript
const data = form.serializedData;
// { name: 'John', email: 'john@example.com' }
```

### `summary`

```typescript
get summary(): string[]
```

Array of all current error messages across all fields.

```typescript
await form.validate();
console.log(form.summary);
// ['Email is required', 'Password must be at least 8 characters']
```

---

## Methods

### `validate()`

```typescript
validate(): Promise<void>
```

Validates **all** fields with `force: true`, running all validators regardless of interaction or blur state.

```typescript
await form.validate();
if (form.valid) {
  // submit
}
```

### `commit()`

```typescript
commit(): void
```

Sets each field's current value as its new initial value, resetting `dirty` to `false`.

### `restoreInitialValues(opts?)`

```typescript
restoreInitialValues(opts?: {
  resetInteractedFlag?: boolean;  // default: true
  commit?: boolean;                // default: true
}): void
```

Resets all fields to their last committed initial values.

### `updateFrom(obj, opts?)`

```typescript
updateFrom(
  obj: Partial<K>,
  opts?: {
    resetInteractedFlag?: boolean;  // default: true
    commit?: boolean;
    throwIfMissingField?: boolean;
  },
): void
```

Sets values for multiple fields at once. Useful for loading data from an API.

```typescript
form.updateFrom({
  name: 'Jane',
  email: 'jane@example.com',
});
```

### `updateField(name, value, opts?)`

```typescript
updateField(
  name: keyof K,
  value?: K[keyof K],
  opts?: {
    resetInteractedFlag?: boolean;
    commit?: boolean;
    throwIfMissingField?: boolean;
  },
): void
```

Update a single field's value with options.

### `addFields(descriptors)`

```typescript
addFields(descriptors: Partial<Descriptors<K>>): void
```

Dynamically add new fields to the form at runtime.

```typescript
form.addFields({
  phone: { value: '', required: 'Phone is required' },
});
```

### `disableFields(fieldKeys)`

```typescript
disableFields(fieldKeys: (keyof K)[]): void
```

Disables the specified fields. Disabled fields skip validation and are not considered required.

### `enableFields(fieldKeys)`

```typescript
enableFields(fieldKeys: (keyof K)[]): void
```

Re-enables previously disabled fields.

### `resetInteractedFlag()`

```typescript
resetInteractedFlag(): void
```

Resets the `interacted` flag on all fields.

### `resetValidatedOnce()`

```typescript
resetValidatedOnce(): void
```

Resets the `validatedAtLeastOnce` flag on all fields.

### `setValidating(validating)`

```typescript
setValidating(validating: boolean): void
```

Manually set the model-level validating state.

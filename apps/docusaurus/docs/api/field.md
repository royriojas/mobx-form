---
sidebar_position: 3
title: Field
---

# Field

The `Field` class represents a single form field with its value, validation state, and metadata. Fields are created automatically by `FormModel` — you interact with them through `model.fields.fieldName`.

## Properties

### Value & State

| Property | Type | Description |
|----------|------|-------------|
| `value` | `T \| undefined` | Current field value |
| `name` | `string` | Name of the field |
| `dirty` | `boolean` | `true` if value differs from initial value |
| `interacted` | `boolean` | `true` if a value has been set on this field |
| `blurred` | `boolean` | `true` if the field has been blurred at least once |
| `hasValue` | `boolean` | `true` if the field has a non-empty value |
| `disabled` | `boolean` | `true` if the field is disabled |
| `required` | `boolean` | `true` if required (always `false` when disabled) |

### Validation

| Property | Type | Description |
|----------|------|-------------|
| `valid` | `boolean` | `true` if no error message is set |
| `error` | `string \| undefined` | Current validation error message |
| `errorMessage` | `string \| undefined` | Same as `error` |
| `validating` | `boolean` | `true` if an async validation is in progress |
| `validatedAtLeastOnce` | `boolean` | `true` if validation has been run at least once |
| `autoValidate` | `boolean` | Whether validation triggers automatically on value change |
| `waitForBlur` | `boolean` | Whether validation is deferred until first blur |

### Other

| Property | Type | Description |
|----------|------|-------------|
| `meta` | `Record<string, any> \| undefined` | Arbitrary metadata from the descriptor |
| `model` | `FormModel<K>` | Reference to the parent form model |
| `rawError` | `ErrorLike \| undefined` | The raw error object (with `message` property) |

---

## Methods

### `setValue(value?, opts?)`

```typescript
setValue(value?: T, opts?: {
  resetInteractedFlag?: boolean;
  commit?: boolean;
}): void
```

Set the field's value. By default, marks the field as interacted and triggers auto-validation if enabled.

```typescript
form.fields.name.setValue('John');

// Programmatic update without marking as interacted
form.fields.name.setValue('Default', { resetInteractedFlag: true });

// Set and commit (new initial value)
form.fields.name.setValue('John', { commit: true });
```

### `validate(opts?)`

```typescript
validate(opts?: { force?: boolean }): Promise<void>
```

Run validation on this field. With `force: true`, validation runs regardless of interaction or blur state.

```typescript
await form.fields.email.validate();
await form.fields.email.validate({ force: true });
```

### `markBlurredAndValidate()`

```typescript
markBlurredAndValidate(): void
```

Marks the field as blurred and triggers validation. Use this in `onBlur` handlers:

```tsx
<input onBlur={() => field.markBlurredAndValidate()} />
```

### `restoreInitialValue(opts?)`

```typescript
restoreInitialValue(opts?: {
  resetInteractedFlag?: boolean;  // default: true
  commit?: boolean;               // default: true
}): void
```

Reverts the field to its last committed initial value.

### `commit()`

```typescript
commit(): void
```

Sets the current value as the new initial value, resetting `dirty` to `false`.

### `setDisabled(disabled)`

```typescript
setDisabled(disabled: boolean): void
```

Enable or disable the field. Disabling also clears any errors.

### `setRequired(val)`

```typescript
setRequired(val: boolean | string): void
```

Dynamically change the required state. Pass a string to set a custom error message.

### `setErrorMessage(msg?)`

```typescript
setErrorMessage(msg?: string): void
```

Manually set or clear the error message.

### `setError(error)`

```typescript
setError(error: { message: string }): void
```

Set the raw error object.

### `resetError()`

```typescript
resetError(): void
```

Clear the validation error.

### `clearValidation()`

```typescript
clearValidation(): void
```

Alias for `resetError()`.

### `markAsInteracted()`

```typescript
markAsInteracted(): void
```

Manually mark the field as interacted.

### `resetInteractedFlag()`

```typescript
resetInteractedFlag(): void
```

Reset the interacted flag to `false`.

### `resetValidatedOnce()`

```typescript
resetValidatedOnce(): void
```

Reset the `validatedAtLeastOnce` flag to `false`.

---

## Value Setter (property)

You can also set the value directly as a property:

```typescript
form.fields.name.value = 'John';
```

This is equivalent to `setValue('John')` — it marks the field as interacted and triggers auto-validation.

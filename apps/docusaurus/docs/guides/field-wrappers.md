---
sidebar_position: 4
title: Field Wrapper Components
---

# Field Wrapper Components

As your app grows, you'll find yourself repeating the same field rendering pattern — binding `value`, `onChange`, `onBlur`, and displaying errors. This guide shows how to create **reusable field wrapper components** that eliminate this boilerplate.

## The Pattern

A field wrapper handles:
1. **Rendering** the label
2. **Binding** `value`, `onChange`, `onBlur` to the MobX field
3. **Displaying** validation errors
4. **Consistent styling** across the entire app

## FieldBlock — The Base Wrapper

Start with a generic `FieldBlock` that wraps any input and renders the label + error:

```tsx
import { observer, Observer } from 'mobx-react-lite';
import type { Field } from 'mobx-form';

type FieldBlockProps<K> = {
  children: React.ReactNode;
  fieldClassName?: string;
  label?: string;
  field: Field<string, K>;
};

export const FieldBlock = observer(function <K>({
  children,
  fieldClassName,
  field,
  label,
}: FieldBlockProps<K>) {
  const theLabel = label ?? field.name;

  return (
    <div className={fieldClassName}>
      {theLabel && (
        <label className="field-label">
          {theLabel}
        </label>
      )}
      <div>{children}</div>
      <Observer>
        {() => (
          <div className="field-error">
            {field.error && (
              <span className="error-text">{field.error}</span>
            )}
          </div>
        )}
      </Observer>
    </div>
  );
});
```

:::tip Why `Observer` inside `FieldBlock`?
The inner `<Observer>` ensures only the error message re-renders when it changes, not the entire field block. This is a MobX optimization technique for fine-grained reactivity.
:::

## InputField — Text Input Wrapper

Build on top of `FieldBlock` to create a fully wired input:

```tsx
import { observer, Observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import type { Field } from 'mobx-form';

type InputFieldProps<K> = {
  field: Field<string, K>;
  fieldClassName?: string;
  label?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  // ... any other native input props
};

export const InputField = observer(function <K>({
  fieldClassName,
  field,
  label,
  ...props
}: InputFieldProps<K>) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      field.setValue(e.target.value);
    },
    [field],
  );

  const handleBlur = useCallback(
    () => {
      field.markBlurredAndValidate();
    },
    [field],
  );

  return (
    <FieldBlock field={field} fieldClassName={fieldClassName} label={label}>
      <Observer>
        {() => (
          <input
            value={field.value}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
        )}
      </Observer>
    </FieldBlock>
  );
});
```

## PasswordInputField

A specialized input with password visibility toggle:

```tsx
export const PasswordInputField = observer(function <K>({
  fieldClassName,
  field,
  label,
  ...props
}: InputFieldProps<K>) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      field.setValue(e.target.value);
    },
    [field],
  );

  const handleBlur = useCallback(
    () => {
      field.markBlurredAndValidate();
    },
    [field],
  );

  return (
    <FieldBlock field={field} fieldClassName={fieldClassName} label={label}>
      <Observer>
        {() => (
          <input
            type="password"
            value={field.value}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
        )}
      </Observer>
    </FieldBlock>
  );
});
```

## Using the Wrappers

With these wrappers, your form component becomes remarkably clean:

```tsx
import { observer } from 'mobx-react-lite';
import { useLoginForm } from './useLoginForm';
import { InputField, PasswordInputField } from './Field';

export const LoginForm = observer(() => {
  const form = useLoginForm();

  const handleSubmit = useCallback(async () => {
    await form.validate();
    if (form.valid) {
      const { email, password } = form.serializedData;
      await signIn(email, password);
    }
  }, [form]);

  return (
    <div>
      <InputField
        label="Email"
        type="email"
        placeholder="Enter your email"
        autoComplete="email"
        field={form.fields.email}
      />

      <PasswordInputField
        label="Password"
        placeholder="Enter your password"
        autoComplete="current-password"
        field={form.fields.password}
      />

      <button onClick={handleSubmit} disabled={form.validating}>
        {form.validating ? 'Loading...' : 'Sign In'}
      </button>
    </div>
  );
});
```

Compare this to the manual approach — no more repetitive `value`, `onChange`, `onBlur`, and error display boilerplate!

## Building More Wrappers

The same pattern extends to any form control:

### SelectField

```tsx
export const SelectField = observer(function <K>({
  field,
  options,
  label,
  fieldClassName,
}: {
  field: Field<string, K>;
  options: { value: string; label: string }[];
  label?: string;
  fieldClassName?: string;
}) {
  return (
    <FieldBlock field={field} fieldClassName={fieldClassName} label={label}>
      <Observer>
        {() => (
          <select
            value={field.value}
            onChange={(e) => field.setValue(e.target.value)}
            onBlur={() => field.markBlurredAndValidate()}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </Observer>
    </FieldBlock>
  );
});
```

### CheckboxField

```tsx
export const CheckboxField = observer(function <K>({
  field,
  label,
}: {
  field: Field<boolean, K>;
  label: string;
}) {
  return (
    <label>
      <Observer>
        {() => (
          <input
            type="checkbox"
            checked={!!field.value}
            onChange={(e) => field.setValue(e.target.checked)}
          />
        )}
      </Observer>
      {label}
      <Observer>
        {() => (
          field.error ? <span className="error">{field.error}</span> : null
        )}
      </Observer>
    </label>
  );
});
```

## Why This Matters

| Without Wrappers | With Wrappers |
|-----------------|---------------|
| 10-15 lines per field | 4-5 lines per field |
| Inconsistent error styling | Uniform error display |
| Easy to forget `onBlur` | Automatically wired |
| Tight coupling to input library | Swap input UI independently |

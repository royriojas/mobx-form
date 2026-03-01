---
sidebar_position: 3
title: React Hooks Pattern
---

# React Hooks Pattern

This guide covers the **recommended patterns** for using `mobx-form` in React applications with hooks.

## The Problem

A `mobx-form` model is a MobX observable. If you create it inside a component without stabilizing it, React will create a new form instance on every render — losing all state:

```typescript
// ❌ BAD: creates a new form on every render
const MyForm = observer(() => {
  const form = createModel({ /* ... */ });
  return <input value={form.fields.name.value} />;
});
```

## The Solution: `useState` with Lazy Initializer

Wrap `createModel` in `useState` with a lazy initializer. This ensures the form is created **once** and persists across re-renders:

```typescript
import { useState } from 'react';
import { createModel } from 'mobx-form';

const useMyForm = () => {
  const [form] = useState(() => createModel({
    descriptors: {
      name: { required: 'Name is required' },
      email: { required: 'Email is required' },
    },
    initialState: { name: '', email: '' },
  }));

  return form;
};
```

:::tip Why `useState` instead of `useRef`?
`useState` with a lazy initializer guarantees the factory runs exactly once. `useRef` also works, but `useState` signals intent more clearly — you're storing stable state, not a mutable ref.
:::

## Full Form Hook Example

Here's a complete, production-ready form hook:

```tsx
import { createModel } from 'mobx-form';
import { useState } from 'react';

export type SignInFormValues = {
  email: string;
  password: string;
};

const getEmailValidator = (message: string) => {
  return ({ value }: { value: string }) => {
    if (!value.includes('@')) {
      throw new Error(message);
    }
  };
};

export const useLoginForm = () => {
  const [form] = useState(() =>
    createModel<SignInFormValues>({
      descriptors: {
        email: {
          required: 'Please enter your email',
          validator: getEmailValidator('Please enter a valid email'),
          waitForBlur: true,
        },
        password: {
          required: 'Please enter your password',
          waitForBlur: true,
        },
      },
      initialState: {
        email: '',
        password: '',
      },
    }),
  );

  return form;
};
```

### Key design decisions:

1. **Types are defined** outside the hook (`SignInFormValues`) for reuse
2. **Validator factories** (like `getEmailValidator`) accept messages as arguments — useful for i18n
3. **`waitForBlur: true`** prevents premature validation while the user is still typing
4. **The hook returns the form model** directly — the consuming component decides how to render it

## Using the Hook in a Component

```tsx
import { observer } from 'mobx-react-lite';
import { useLoginForm } from './useLoginForm';

export const LoginForm = observer(() => {
  const form = useLoginForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await form.validate();
    if (form.valid) {
      const { email, password } = form.serializedData;
      await signIn(email, password);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email</label>
        <input
          type="email"
          value={form.fields.email.value}
          onChange={(e) => form.fields.email.setValue(e.target.value)}
          onBlur={() => form.fields.email.markBlurredAndValidate()}
        />
        {form.fields.email.error && (
          <span className="error">{form.fields.email.error}</span>
        )}
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          value={form.fields.password.value}
          onChange={(e) => form.fields.password.setValue(e.target.value)}
          onBlur={() => form.fields.password.markBlurredAndValidate()}
        />
        {form.fields.password.error && (
          <span className="error">{form.fields.password.error}</span>
        )}
      </div>

      <button type="submit" disabled={form.validating}>
        {form.validating ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
});
```

## With Internationalization (i18n)

When using a translation system, create the form inside the hook so it captures the current translations:

```tsx
import { useTranslation } from '@/hooks/useTranslation';
import { createModel } from 'mobx-form';
import { useState } from 'react';

export const useLoginForm = () => {
  const { t } = useTranslation();

  const [form] = useState(() =>
    createModel<SignInFormValues>({
      descriptors: {
        email: {
          required: t.auth.enterEmail,
          validator: getEmailValidator(t.auth.invalidEmail),
          waitForBlur: true,
        },
        password: {
          required: t.auth.enterPassword,
          waitForBlur: true,
        },
      },
      initialState: { email: '', password: '' },
    }),
  );

  return form;
};
```

:::note
The translations are captured at form-creation time (first render). If you need dynamic messages that change after creation, consider using `field.setRequired(newMessage)` or managing validators separately.
:::

## Multiple Forms per Page

Each hook call creates an independent form instance:

```tsx
const ProfilePage = observer(() => {
  const nameForm = useNameForm();
  const addressForm = useAddressForm();
  const passwordForm = usePasswordForm();

  // Each form validates independently
  return (
    <div>
      <NameSection form={nameForm} />
      <AddressSection form={addressForm} />
      <PasswordSection form={passwordForm} />
    </div>
  );
});
```

## Resetting a Form

Use `restoreInitialValues()` to reset all fields back to their initial state:

```tsx
const handleReset = () => {
  form.restoreInitialValues();
};
```

Or update from new data (e.g., after loading from an API):

```tsx
useEffect(() => {
  if (userData) {
    form.updateFrom(userData);
  }
}, [userData, form]);
```

---
slug: /
sidebar_position: 1
title: Introduction
---

# mobx-form

**Simple, robust, and extensible form state management for [MobX](https://github.com/mobxjs/mobx).**

`mobx-form` simplifies form validation and state management in MobX-powered React applications. It provides a declarative way to define form models with synchronous and asynchronous validation, dirty tracking, and easy data serialization.

## Features

- **📋 Declarative Form Definition** — Define your form structure with simple descriptors
- **⚡️ Reactive** — Built on MobX for high-performance, fine-grained reactivity
- **✅ Sync & Async Validation** — Support for multiple validators per field, cross-field validation, and async validators with loading states
- **🔍 State Tracking** — `dirty`, `interacted`, `validating`, `validatedAtLeastOnce`, and `blurred` states per field and at the model level
- **🛠 Data Utilities** — `serializedData` for API payloads, `commit()` / `restoreInitialValues()` for transaction-like behavior
- **🧩 Dynamic Fields** — Add fields at runtime with `addFields()`
- **🔒 TypeScript First** — Full generic type safety with `createModel<T>()`

## Quick Example

```typescript
import { createModel } from 'mobx-form';

const loginForm = createModel({
  initialState: { username: '', password: '' },
  descriptors: {
    username: { required: 'Username is required', autoValidate: true },
    password: {
      required: true,
      validator: ({ value }) => {
        if (value.length < 6) {
          return { error: 'Password must be at least 6 characters' };
        }
      },
    },
  },
});

await loginForm.validate();

console.log(loginForm.valid);          // false
console.log(loginForm.summary);        // ['Password must be at least 6 characters']
console.log(loginForm.serializedData); // { username: '', password: '' }
```

## How It Works

1. **Define** a form model with field descriptors and initial state
2. **Bind** fields to your React components using MobX's `observer`
3. **Validate** on blur, on change, or manually — `mobx-form` handles the rest
4. **Read** `serializedData` when ready to submit

The model is a plain MobX observable — no providers, no context, no boilerplate. It works with any React component library and any styling solution.

## Next Steps

- [**Installation**](./installation) — Install `mobx-form` in your project
- [**Basic Usage**](./guides/basic-usage) — Create your first form
- [**Validation**](./guides/validation) — Sync, async, and cross-field validation
- [**React Patterns**](./guides/react-hooks) — Best practices with hooks and state
- [**API Reference**](./api/create-model) — Full API documentation

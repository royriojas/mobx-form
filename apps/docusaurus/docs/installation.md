---
sidebar_position: 2
title: Installation
---

# Installation

## Prerequisites

- **Node.js** ≥ 18
- **MobX** ≥ 6.0.1 (peer dependency)
- **React** ≥ 18 (recommended for React integration)

## Install

```bash
# npm
npm install mobx-form mobx

# bun
bun add mobx-form mobx

# yarn
yarn add mobx-form mobx

# pnpm
pnpm add mobx-form mobx
```

:::note
`mobx` is a **peer dependency** — you must install it alongside `mobx-form`.
:::

## For React Projects

If you're using `mobx-form` with React, you'll also need `mobx-react-lite`:

```bash
npm install mobx-react-lite
# or
bun add mobx-react-lite
```

## Module Formats

`mobx-form` ships with:

| Format | Entry Point |
|--------|-------------|
| **ESM** (import) | `dist/index.mjs` |
| **CJS** (require) | `dist/index.cjs` |
| **Types** (ESM) | `dist/mobx-form.d.mts` |
| **Types** (CJS) | `dist/mobx-form.d.ts` |

The package uses the `exports` field in `package.json`, so modern bundlers (Vite, webpack 5, esbuild, bun) will automatically resolve the correct format.

## Verify Installation

```typescript
import { createModel } from 'mobx-form';

const form = createModel({
  descriptors: {
    name: { required: 'Name is required' },
  },
  initialState: { name: '' },
});

console.log(form.fields.name.value); // ''
console.log(form.valid);             // true (not validated yet)
```

If this runs without errors, you're all set!

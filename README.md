# mobx-form

[![NPM Version](https://img.shields.io/npm/v/mobx-form.svg)](https://www.npmjs.com/package/mobx-form)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/royriojas/mobx-form/actions/workflows/ci.yml/badge.svg)](https://github.com/royriojas/mobx-form/actions/workflows/ci.yml)

> A simple, robust, and extensible form state management helper for [MobX](https://github.com/mobxjs/mobx).

[**View Documentation**](https://royriojas.github.io/mobx-form/) | [**View Live Demo / Storybook**](https://royriojas.github.io/mobx-form/storybook/)

## Quick Start

```bash
npm install --save mobx-form mobx
# or
bun add mobx-form mobx
```

```typescript
import { createModel } from 'mobx-form';

const loginForm = createModel({
  initialState: { username: '', password: '' },
  descriptors: {
    username: { required: 'Username is required', autoValidate: true },
    password: {
      required: true,
      validator: (field) => {
        if (field.value.length < 6) {
          return { error: 'Password must be at least 6 characters' };
        }
      },
    },
  },
});

await loginForm.validate();
console.log(loginForm.valid);       // false
console.log(loginForm.summary);     // validation summary
console.log(loginForm.serializedData); // { username: '', password: '' }
```

## Packages

| Package | Description |
|---------|-------------|
| [mobx-form](./packages/mobx-form) | Core form state management library |

## Monorepo Structure

```
mobx-form/
├── packages/
│   └── mobx-form/       # Core library (published to npm)
├── turbo.json           # Turborepo config
├── clean.sh             # Clean all build artifacts
├── publish.sh           # Publish helper script
└── package.json         # Workspace root
```

## Development

```bash
# Install dependencies
bun install

# Run tests
bun run test

# Lint & type check
bun run verify

# Build
bun run build

# Run Storybook
bun run storybook
```

## License

MIT

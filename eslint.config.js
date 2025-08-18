import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import tailwind from "eslint-plugin-tailwindcss";
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config({
  extends: [js.configs.recommended, ...tseslint.configs.recommended],
  files: ['**/*.{ts,tsx}'],
  ignores: ['dist'],
  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,
  },
  plugins: {
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
    tailwindcss: tailwind,
    prettier: eslintPluginPrettierRecommended.plugins.prettier,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    ...tailwind.configs.recommended.rules,
    ...eslintPluginPrettierRecommended.rules,
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
  settings: {
    tailwindcss: {
      calee: ["classnames", "clsx", "ctl", "cn", "cnByMatchesH", "twmerge", "tw", "twMerge"],
    }
  }
})

import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

export default [
  {
    input: 'src/FormModel.js',
    output: {
      file: pkg.browser,
      name: 'MobxForm',
      format: 'umd',
    },
    plugins: [
      resolve(),
      babel({
        babelrc: false,
        presets: [
          [
            'env',
            {
              targets: {
                browsers: ['last 2 versions', 'safari >= 7'],
              },
              modules: false,
            },
          ],
        ],
        plugins: ['transform-decorators-legacy', 'transform-class-properties', 'external-helpers'],
        exclude: 'node_modules/**', // only transpile our source code
      }),
      commonjs(),
    ],
  },
  {
    input: 'src/FormModel.js',
    external: ['mobx', 'debouncy', 'coalescy', 'jq-trim'],
    output: [{ file: pkg.main, format: 'cjs' }, { file: pkg.module, format: 'es' }],
    plugins: [
      babel({
        babelrc: false,
        presets: [
          [
            'env',
            {
              targets: {
                browsers: ['last 2 versions', 'safari >= 7'],
              },
              modules: false,
            },
          ],
        ],
        plugins: ['transform-decorators-legacy', 'transform-class-properties', 'external-helpers'],
        exclude: ['node_modules/**'],
      }),
    ],
  },
];

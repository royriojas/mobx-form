import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import pkg from './package.json';

export default [
  {
    input: 'src/FormModel.js',
    external: ['mobx'],
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
            '@babel/preset-env',
            {
              targets: {
                browsers: ['last 2 versions', 'safari >= 7'],
              },
              modules: false,
            },
          ],
        ],
        plugins: [
          [
            '@babel/plugin-proposal-decorators',
            {
              legacy: true,
            },
          ],
          [
            '@babel/plugin-proposal-class-properties',
            {
              loose: true,
            },
          ],
          '@babel/plugin-proposal-object-rest-spread',
        ],
        exclude: ['node_modules/**'], // only transpile our source code
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
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
            '@babel/preset-env',
            {
              targets: {
                browsers: [
                  'last 2 Chrome versions',
                  'not Chrome < 60',
                  'last 2 Safari versions',
                  'not Safari < 10.1',
                  'last 2 iOS versions',
                  'not iOS < 10.3',
                  'last 2 Firefox versions',
                  'not Firefox < 54',
                  'last 2 Edge versions',
                  'not Edge < 15',
                ],
              },
              modules: false,
            },
          ],
        ],
        plugins: [
          [
            '@babel/plugin-proposal-decorators',
            {
              legacy: true,
            },
          ],
          [
            '@babel/plugin-proposal-class-properties',
            {
              loose: true,
            },
          ],
          '@babel/plugin-proposal-object-rest-spread',
        ],
        exclude: ['node_modules/**'], // only transpile our source code
      }),
    ],
  },

  {
    input: 'src/FormModel.js',
    external: ['mobx', 'debouncy', 'coalescy', 'jq-trim'],
    output: [{ file: pkg._legacy_module, format: 'es' }],
    plugins: [
      babel({
        babelrc: false,
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                browsers: ['last 2 versions'],
              },
              modules: false,
            },
          ],
        ],
        plugins: [
          [
            '@babel/plugin-proposal-decorators',
            {
              legacy: true,
            },
          ],
          [
            '@babel/plugin-proposal-class-properties',
            {
              loose: true,
            },
          ],
          '@babel/plugin-proposal-object-rest-spread',
        ],
        exclude: ['node_modules/**'], // only transpile our source code
      }),
    ],
  },
];

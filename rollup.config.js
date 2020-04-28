import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import pkg from './package.json';

const getBabelPlugins = ({ includeRuntime }) => {
  const plugins = [
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
    '@babel/plugin-proposal-optional-chaining',
  ];

  if (includeRuntime) {
    plugins.push('@babel/plugin-transform-runtime');
  }
  return plugins;
};

const commonBabelConfig = {
  plugins: getBabelPlugins({ includeRuntime: false }),
  exclude: ['node_modules/**'], // only transpile our source code
};

const commonExternals = [
  'mobx',
  'debouncy',
  'jq-trim',
  '@babel/runtime/helpers/initializerDefineProperty',
  '@babel/runtime/helpers/toConsumableArray',
  '@babel/runtime/helpers/defineProperty',
  '@babel/runtime/helpers/objectWithoutProperties',
  '@babel/runtime/helpers/classCallCheck',
  '@babel/runtime/helpers/createClass',
  '@babel/runtime/helpers/initializerWarningHelper',
  '@babel/runtime/helpers/applyDecoratedDescriptor',
  '@babel/runtime/regenerator',
  '@babel/runtime/helpers/asyncToGenerator',
];

export default [
  {
    input: 'src/FormModel.js',
    external: ['mobx'],
    output: {
      file: pkg._browser,
      name: 'MobxForm',
      format: 'umd',
      globals: { mobx: 'mobx' },
    },
    plugins: [
      resolve(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
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
        babelHelpers: 'bundled',
        ...commonBabelConfig,
      }),
      commonjs(),
    ],
  },
  {
    input: 'src/FormModel.js',
    external: commonExternals,
    output: [{ file: pkg.main, format: 'cjs' }, { file: pkg.module, format: 'es' }],
    plugins: [
      babel({
        babelrc: false,
        babelHelpers: 'runtime',
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
        ...commonBabelConfig,
        plugins: getBabelPlugins({ includeRuntime: true }),
      }),
      commonjs(),
    ],
  },

  {
    input: 'src/FormModel.js',
    external: commonExternals,
    output: [{ file: pkg._legacy_module, format: 'cjs' }],
    plugins: [
      babel({
        babelrc: false,
        babelHelpers: 'runtime',
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
        ...commonBabelConfig,
        plugins: getBabelPlugins({ includeRuntime: true }),
      }),
      commonjs(),
    ],
  },
];

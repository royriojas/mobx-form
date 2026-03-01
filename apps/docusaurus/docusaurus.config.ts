import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'mobx-form',
  tagline: 'Simple, robust form state management for MobX',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://royriojas.github.io',
  baseUrl: '/mobx-form/',

  organizationName: 'royriojas',
  projectName: 'mobx-form',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: 'https://github.com/royriojas/mobx-form/tree/main/apps/docusaurus/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'mobx-form',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://royriojas.github.io/mobx-form/storybook/',
          label: 'Storybook',
          position: 'left',
        },
        {
          href: 'https://www.npmjs.com/package/mobx-form',
          label: 'npm',
          position: 'right',
        },
        {
          href: 'https://github.com/royriojas/mobx-form',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/',
            },
            {
              label: 'API Reference',
              to: '/api/create-model',
            },
            {
              label: 'React Patterns',
              to: '/guides/react-hooks',
            },
          ],
        },
        {
          title: 'Links',
          items: [
            {
              label: 'Storybook',
              href: 'https://royriojas.github.io/mobx-form/storybook/',
            },
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/mobx-form',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/royriojas/mobx-form',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Roy Riojas. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

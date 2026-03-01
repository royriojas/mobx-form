import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    'installation',
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/basic-usage',
        'guides/validation',
        'guides/react-hooks',
        'guides/field-wrappers',
        'guides/advanced-patterns',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/create-model',
        'api/form-model',
        'api/field',
        'api/field-descriptor',
        'api/types',
      ],
    },
  ],
};

export default sidebars;

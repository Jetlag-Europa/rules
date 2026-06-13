import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://rules.jetlageuropa.org',
  integrations: [
    starlight({
      title: 'Jet Lag Community Rules',
      description: 'Versioned rulebooks and game-specific rule documents.',
      sidebar: [
        {
          label: 'Start',
          items: ['index'],
        },
        {
          label: 'Master Rules',
          items: [
            {
              label: 'Latest',
              autogenerate: { directory: 'master/latest' },
            },
            'master/archive',
          ],
        },
        {
          label: 'Game Rules',
          autogenerate: { directory: 'games' },
        },
        {
          label: 'Templates',
          collapsed: true,
          autogenerate: { directory: 'templates' },
        },
      ],
      customCss: ['./src/styles/custom.css'],
      editLink: {
        baseUrl: 'https://github.com/Jetlag-Europa/rules/edit/main/',
      },
    }),
  ],
});

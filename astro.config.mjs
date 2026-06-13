import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://rules.jetlageuropa.org',
  integrations: [
    starlight({
      title: 'Jet Lag Community Rules',
      description: 'Rulebooks and game-specific rule documents.',
      sidebar: [
        {
          label: 'Start',
          items: ['index'],
        },
        {
          label: 'Main Rules',
          autogenerate: { directory: 'main' },
        },
        {
          label: 'Game Rules',
          autogenerate: { directory: 'games' },
        },
      ],
      customCss: ['./src/styles/custom.css'],
      editLink: {
        baseUrl: 'https://github.com/Jetlag-Europa/rules/edit/main/',
      },
    }),
  ],
});

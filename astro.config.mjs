import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://rules.jetlageuropa.org",

  integrations: [
    starlight({
      title: "Jet Lag: Rules",
      description: "Rulebooks and game-specific rule documents.",
      sidebar: [
        {
          label: "Main Rules",
          autogenerate: { directory: "main" },
        },
        {
          label: "Game Rules",
          autogenerate: { directory: "games" },
        },
        {
          label: "Guides",
          autogenerate: { directory: "guides" },
        },
      ],
      customCss: ["./src/styles/custom.css"],
      editLink: {
        baseUrl: "https://github.com/Jetlag-Europa/rules/edit/main/",
      },
    }),
  ],

  adapter: cloudflare()
});
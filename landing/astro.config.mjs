import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";

export default defineConfig({
  integrations: [react(), tailwind()],
  output: "static",
  adapter: node({
    mode: "standalone",
  }),
  site: process.env.SITE_URL,
});

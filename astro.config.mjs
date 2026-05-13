import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel/serverless';
import react from '@astrojs/react';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },

  output: "server",

  adapter: vercel({
    webAnalytics: false
  }),

  integrations: [react()]
});
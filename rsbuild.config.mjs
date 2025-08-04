import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/client/index.jsx'
    }
  },
  html: {
    title: "Propiel - Gestión Dermatológica",
    favicon: './public/propiel-logo.png'
  }
});

import { defineConfig, loadEnv } from "vite";
import { fileURLToPath } from "url";
import path from "path";

import vue from "@vitejs/plugin-vue";
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://vitejs.dev/config/

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      vue({ 
        template: { transformAssetUrls }
      }),
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
      vuetify({
        autoImport: true,
      }),
    ],
    define: { 'process.env': {} },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        "@assets": fileURLToPath(new URL('./src/assets', import.meta.url)),
        "@components": fileURLToPath(new URL('./src/components', import.meta.url)),
        "@stores": fileURLToPath(new URL('./src/stores', import.meta.url)),
        "@views": fileURLToPath(new URL('./src/views', import.meta.url)),
      },
    },
    build: {
      outDir: "../dist",
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
        },
      },
    },
    server: {
      proxy: {
        "/api": {
          target: "http://localhost/project-root/public/api/chat",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
      port: 5173
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  };
});

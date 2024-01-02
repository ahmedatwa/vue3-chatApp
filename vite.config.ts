import { defineConfig, loadEnv } from "vite";
import { fileURLToPath } from "url";
import path from "node:path";
import vue from "@vitejs/plugin-vue";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

// https://vitejs.dev/config/

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      vue({
        template: { transformAssetUrls },
      }),
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
      vuetify({
        autoImport: true,
      }),
      // bindingSqlite3()
    ],
    define: { "process.env": {}, },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      outDir: "./dist",
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
        },
      },
    },
    server: {
      port: 5173,
      proxy: {
        // '/api': {
        //   target: 'http://localhost/project-root/public/api/chat',
        //   changeOrigin: true,
        //   //rewrite: (path) => path.replace(/^\/api/, ''),
        // },
      }
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  };
});

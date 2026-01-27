import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  // Charge les variables .env, .env.development, .env.production, etc.
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [vue()],

    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_HTTP_URL,
          changeOrigin: true,
        },
      },
    },
  };
});

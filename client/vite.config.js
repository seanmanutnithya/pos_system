import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // The "" prefix loads every variable, not only VITE_ ones. API_PROXY_TARGET
  // is only read here by the dev server and never ends up in the browser bundle.
  const env = loadEnv(mode, process.cwd(), "");

  if (command === "serve" && !env.API_PROXY_TARGET) {
    console.warn(
      "\n  API_PROXY_TARGET is not set, so API requests won't reach the backend." +
        "\n  Add it to client/.env.development (see client/.env.example).\n",
    );
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    server: {
      // Forward API calls to the backend, so the browser only talks to the dev
      // server's origin and the backend doesn't need CORS during development
      proxy: env.API_PROXY_TARGET
        ? { "/api": { target: env.API_PROXY_TARGET, changeOrigin: true } }
        : undefined,
    },
  };
});

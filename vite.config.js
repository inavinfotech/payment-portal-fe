import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  let base = env.VITE_ROUTER_BASENAME || env.VITE_BASENAME || "/payment/";

  if (!base.endsWith("/")) {
    base = `${base}/`;
  }

  return {
    base,
    plugins: [react(), tailwindcss()],
  };
});

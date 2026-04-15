import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Any request starting with /api will be forwarded to the backend
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});

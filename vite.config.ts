import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    proxy: {
      // Proxy requests that start with /api/
      '/api/': {
        target: 'http://beanbag-backend:8080',
        changeOrigin: true, // Needed for virtual hosted sites
        // Rewrite the path: remove the '/api/' prefix before forwarding
        // e.g., /api/users -> /users
        rewrite: (path: string) => path.replace(/^\/api\//, ''),
        secure: false, // Set to true if backend is HTTPS with valid cert
      },
    }
  }
});

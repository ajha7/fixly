import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import * as path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }: { mode: string }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy API requests to the backend server
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, '')
      },
      // Proxy WebSocket connections
      '/connection': {
        target: 'ws://localhost:3000',
        ws: true
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(new URL(import.meta.url).pathname), "./src"),
    },
  },
}));

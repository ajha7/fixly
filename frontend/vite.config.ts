import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import * as path from "path";
import { componentTagger } from "lovable-tagger";

// Safe access to environment variables
const getEnv = (key: string, defaultValue: string): string => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  
  try {
    // @ts-ignore - import.meta.env might not be available during build
    return import.meta.env?.[key] || defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }: { mode: string }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy API requests to the backend server
      '/api': {
        // target: getEnv('VITE_API_URL', 'http://localhost:3000'),
        // use vite_api_url without backup
        target: import.meta.env.VITE_API_URL,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, '')
      },
      // Proxy WebSocket connections
      // '/connection': {
      //   target: getEnv('VITE_WS_URL', 'ws://localhost:3000'),
      //   ws: true
      // }
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

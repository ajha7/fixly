/// <reference types="vite/client" />

// Add type definitions for import.meta
interface ImportMeta {
  readonly env: {
    readonly VITE_API_URL?: string;
    readonly VITE_WS_URL?: string;
    readonly [key: string]: string | undefined;
  }
}

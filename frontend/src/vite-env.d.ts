/// <reference types="vite/client" />

// Add type definitions for import.meta
interface ImportMeta {
  readonly env: {
    readonly VITE_API_URL?: string;
    // VITE_WS_URL?: string;
    readonly [key: string]: string | undefined;
    readonly MODE: string;
    readonly BASE_URL: string;
    readonly PROD: boolean;
    readonly DEV: boolean;
  };
}

// Add module declarations for untyped modules
declare module '@vitejs/plugin-react-swc';
declare module 'lovable-tagger' {
  export function componentTagger(): any;
}

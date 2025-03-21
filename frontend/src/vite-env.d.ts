/// <reference types="vite/client" />

// Add type definitions for import.meta
interface ImportMeta {
  url: string;
  env: {
    VITE_API_URL?: string;
    VITE_WS_URL?: string;
    [key: string]: string | undefined;
  };
}

// Add module declarations for untyped modules
declare module '@vitejs/plugin-react-swc';
declare module 'lovable-tagger' {
  export function componentTagger(): any;
}

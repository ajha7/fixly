/// <reference types="vite/client" />

// Add type definitions for import.meta
interface ImportMeta {
  url: string;
}

// Add module declarations for untyped modules
declare module '@vitejs/plugin-react-swc';
declare module 'lovable-tagger' {
  export function componentTagger(): any;
}

/// <reference types="vite/client" />

declare const VITE_SERVER_PORT: number;
declare const VITE_API_URL: string;

declare module 'vue3-emoji-picker';

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
  

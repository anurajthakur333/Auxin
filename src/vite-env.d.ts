/// <reference types="vite/client" />

// Audio file imports
declare module '*.mp3' {
  const src: string;
  export default src;
}

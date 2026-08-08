/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_CC_SWITCH_REPOSITORY_URL?: string;
    readonly VITE_CC_SWITCH_RELEASE_TAG_PREFIX?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};

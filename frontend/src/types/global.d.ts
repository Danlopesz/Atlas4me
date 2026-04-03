/// <reference types="vite/client" />

/**
 * @module types/global
 * Augment the global Window interface with custom runtime flags
 * used across the Atlas4Me globe system.
 */

export { };

declare global {
  interface Window {
    /**
     * Runtime flag set by GlobeCamera when performing a
     * fly-to animation. While true, Earth idle rotation is paused.
     */
    __globeIsFocusing?: boolean;
  }
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
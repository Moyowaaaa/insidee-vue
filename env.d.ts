/// <reference types="vite/client" />
/// <reference types="google.maps" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_GOOGLE_MAP_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

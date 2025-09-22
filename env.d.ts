/// <reference types="vite/client" />
/// <reference types="tailwindcss" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_PANIC_BASE?: string
  readonly VITE_MAP_STYLE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

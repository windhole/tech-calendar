/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOATCOUNTER_COUNT_URL?: string
}

declare module 'virtual:event-yaml-sources' {
  export const eventYamlSources: { name: string; mtimeMs: number }[]
}


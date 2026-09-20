/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOATCOUNTER_COUNT_URL?: string
}

declare module '*.md?raw' {
  const content: string
  export default content
}

declare module 'virtual:event-yaml-sources' {
  export const eventYamlSources: { name: string; mtimeMs: number }[]
}


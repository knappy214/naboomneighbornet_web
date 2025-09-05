import type { DefineComponent } from 'vue'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: (key: string, ...args: any[]) => string
    $tc: (key: string, choice?: number, ...args: any[]) => string
    $te: (key: string) => boolean
    $d: (value: Date | number, key?: string) => string
    $n: (value: number, key?: string) => string
    $tm: (key: string) => any
    $rt: (message: string) => string
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $t: (key: string, ...args: any[]) => string
    $tc: (key: string, choice?: number, ...args: any[]) => string
    $te: (key: string) => boolean
    $d: (value: Date | number, key?: string) => string
    $n: (value: number, key?: string) => string
    $tm: (key: string) => any
    $rt: (message: string) => string
  }
}

export {}

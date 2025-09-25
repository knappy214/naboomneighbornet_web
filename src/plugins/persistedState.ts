import type { PiniaPluginContext } from 'pinia'

type PersistedStateSerializer = {
  serialize: (value: unknown) => string
  deserialize: (value: string) => unknown
}

export interface PersistedStateOptions {
  key?: string
  storage?: Storage
  paths?: string[]
  serializer?: PersistedStateSerializer
  debug?: boolean
}

type PersistedStateConfig = boolean | PersistedStateOptions | Array<boolean | PersistedStateOptions>

declare module 'pinia' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: PersistedStateConfig
  }
}

const defaultSerializer: PersistedStateSerializer = {
  serialize: JSON.stringify,
  deserialize: JSON.parse,
}

const normalizeOptions = (
  storeId: string,
  option: boolean | PersistedStateOptions,
): Required<PersistedStateOptions> => {
  if (option === true) {
    return {
      key: `pinia-${storeId}`,
      storage: localStorage,
      paths: [],
      serializer: defaultSerializer,
      debug: false,
    }
  }

  return {
    key: option.key ?? `pinia-${storeId}`,
    storage: option.storage ?? localStorage,
    paths: option.paths ?? [],
    serializer: option.serializer ?? defaultSerializer,
    debug: option.debug ?? false,
  }
}

const pickPaths = (state: Record<string, unknown>, paths: string[]) => {
  if (!paths.length) return state
  const subset: Record<string, unknown> = {}
  paths.forEach((path) => {
    if (path in state) {
      subset[path] = state[path]
    }
  })
  return subset
}

export function piniaPluginPersistedstate({ store, options }: PiniaPluginContext) {
  const persistOptions = options.persist
  if (!persistOptions) return

  const configs = Array.isArray(persistOptions) ? persistOptions : [persistOptions]

  configs
    .filter((config) => config !== false)
    .forEach((config) => {
      const normalized = normalizeOptions(store.$id, config)

      try {
        const raw = normalized.storage.getItem(normalized.key)
        if (raw) {
          const value = normalized.serializer.deserialize(raw)
          if (value && typeof value === 'object') {
            store.$patch(value as Record<string, unknown>)
          }
        }
      } catch (error) {
        if (normalized.debug) {
          console.warn('[pinia-persistedstate] Failed to restore state', error)
        }
      }

      store.$subscribe(
        (_mutation, state) => {
          try {
            const toStore = pickPaths(state as Record<string, unknown>, normalized.paths)
            normalized.storage.setItem(normalized.key, normalized.serializer.serialize(toStore))
          } catch (error) {
            if (normalized.debug) {
              console.warn('[pinia-persistedstate] Failed to persist state', error)
            }
          }
        },
        { detached: true },
      )
    })
}

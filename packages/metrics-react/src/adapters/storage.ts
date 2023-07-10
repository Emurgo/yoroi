import AsyncStorage from '@react-native-async-storage/async-storage'
import {Metrics} from '@yoroi/types'

const initialDeps = {storage: AsyncStorage} as const

export function makeMetricsStorage(
  deps = initialDeps,
): Readonly<Metrics.Storage> {
  return {
    enabled: {
      save: (enabled) =>
        deps.storage.setItem(metricsStorageEnabledKey, JSON.stringify(enabled)),
      read: () =>
        deps.storage
          .getItem(metricsStorageEnabledKey)
          .then((value) => parseBoolean(value) ?? false),
      remove: () => deps.storage.removeItem(metricsStorageEnabledKey),
    },
  } as const as Metrics.Storage
}

export const metricsStorageEnabledKey = 'metrics-enabled'

// * === UTILS ===
// * NOTE copied from utils it should be imported from utils package later
const parseBoolean = (data: unknown) => {
  const parsed = parseSafe(data)
  return isBoolean(parsed) ? parsed : undefined
}

const parseSafe = (text: any) => {
  try {
    return JSON.parse(text) as unknown
  } catch (_) {
    return undefined
  }
}

const isBoolean = (data: unknown): data is boolean => typeof data === 'boolean'

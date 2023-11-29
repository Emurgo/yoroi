import AsyncStorage from '@react-native-async-storage/async-storage'
import {Resolver, BaseStorage} from '@yoroi/types'

const initialDeps = {storage: AsyncStorage} as const

export function resolverStorageMaker(
  deps: {storage: BaseStorage | typeof AsyncStorage} = initialDeps,
): Readonly<Resolver.Storage> {
  const {storage} = deps

  const notice: Readonly<Resolver.Storage['notice']> = {
    save: (newNoticed) =>
      storage.setItem(resolverStorageNoticedKey, JSON.stringify(newNoticed)),
    read: () =>
      storage
        .getItem(resolverStorageNoticedKey)
        .then((value) => parseBoolean(value) ?? false),
    remove: () => storage.removeItem(resolverStorageNoticedKey),
    key: resolverStorageNoticedKey,
  } as const

  const clear = async () => {
    await Promise.all([storage.removeItem(resolverStorageNoticedKey)])
  }

  return {
    notice,
    clear,
  } as const
}

export const resolverStorageNoticedKey = 'resolver-notice'

// * === UTILS ===
// * NOTE copied from utils it should be imported from utils package later
export const parseBoolean = (data: unknown) => {
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

export const isBoolean = (data: unknown): data is boolean =>
  typeof data === 'boolean'

import AsyncStorage from '@react-native-async-storage/async-storage'
import {parseBoolean} from '@yoroi/common'
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

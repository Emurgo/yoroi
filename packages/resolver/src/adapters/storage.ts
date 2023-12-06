import AsyncStorage from '@react-native-async-storage/async-storage'
import {parseBoolean} from '@yoroi/common'
import {Resolver, BaseStorage} from '@yoroi/types'

const initialDeps = {storage: AsyncStorage} as const

export function resolverStorageMaker(
  deps: {storage: BaseStorage | typeof AsyncStorage} = initialDeps,
): Readonly<Resolver.Storage> {
  const {storage} = deps

  const showNotice: Readonly<Resolver.Storage['showNotice']> = {
    save: (newShowNotice) =>
      storage.setItem(resolverStorageNoticedKey, JSON.stringify(newShowNotice)),
    read: () =>
      storage
        .getItem(resolverStorageNoticedKey)
        .then((value) => parseBoolean(value) ?? true),
    remove: () => storage.removeItem(resolverStorageNoticedKey),
    key: resolverStorageNoticedKey,
  } as const

  const clear = async () => {
    await Promise.all([storage.removeItem(resolverStorageNoticedKey)])
  }

  return {
    showNotice,
    clear,
  } as const
}

export const resolverStorageNoticedKey = 'resolver-show-notice'

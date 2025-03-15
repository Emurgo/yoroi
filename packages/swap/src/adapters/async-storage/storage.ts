import AsyncStorage from '@react-native-async-storage/async-storage'
import {parseSafe} from '@yoroi/common'
import {Swap, BaseStorage} from '@yoroi/types'
import {freeze} from 'immer'

const initialDeps = {storage: AsyncStorage} as const

export function swapStorageMaker(
  deps: {storage: BaseStorage | typeof AsyncStorage} = initialDeps,
): Readonly<Swap.Storage> {
  const {storage} = deps

  const config: Readonly<Swap.Storage['config']> = {
    save: (newConfig) =>
      storage.setItem(swapStorageConfigKey, JSON.stringify(newConfig)),
    read: () =>
      storage.getItem(swapStorageConfigKey).then(
        (value) =>
          (parseSafe(value) as Swap.ManagerConfig) ?? {
            slippage: 1,
            routingPreference: 'auto',
          },
      ),
    remove: () => storage.removeItem(swapStorageConfigKey),
    key: swapStorageConfigKey,
  } as const

  const clear = async () => {
    await Promise.all([config.remove()])
  }

  return freeze(
    {
      config,
      clear,
    } as const,
    true,
  )
}

export const swapStorageConfigKey = 'swap-config'

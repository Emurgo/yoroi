import AsyncStorage from '@react-native-async-storage/async-storage'
import {parseSafe} from '@yoroi/common'
import {Swap, BaseStorage} from '@yoroi/types'
import {freeze} from 'immer'

const initialDeps = {storage: AsyncStorage} as const

export function swapStorageMaker(
  deps: {storage: BaseStorage | typeof AsyncStorage} = initialDeps,
): Readonly<Swap.Storage> {
  const {storage} = deps

  const settings: Readonly<Swap.Storage['settings']> = {
    save: (newSettings) =>
      storage.setItem(swapStorageSettingsKey, JSON.stringify(newSettings)),
    read: () =>
      storage.getItem(swapStorageSettingsKey).then(
        (value) =>
          (parseSafe(value) as Swap.ManagerSettings) ?? {
            slippage: 1,
            routingPreference: 'auto',
          },
      ),
    remove: () => storage.removeItem(swapStorageSettingsKey),
    key: swapStorageSettingsKey,
  } as const

  const clear = async () => {
    await Promise.all([settings.remove()])
  }

  return freeze(
    {
      settings,
      clear,
    } as const,
    true,
  )
}

export const swapStorageSettingsKey = 'swap-settings'

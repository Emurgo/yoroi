import AsyncStorage from '@react-native-async-storage/async-storage'
import type {Swap} from '@yoroi/types'

const initialDeps = {storage: AsyncStorage} as const

export function makeSwapStorage(deps = initialDeps): Readonly<Swap.Storage> {
  return {
    slippage: {
      save: (slippage) =>
        deps.storage.setItem(swapStorageSlippageKey, JSON.stringify(slippage)),
      read: () =>
        deps.storage
          .getItem(swapStorageSlippageKey)
          .then((value) => parseNumber(value) ?? 0),
      remove: () => deps.storage.removeItem(swapStorageSlippageKey),
    },
  } as const
}

export const swapStorageSlippageKey = 'swap-slippage'

// * === UTILS ===
// * NOTE copied from utils it should be imported from utils package later
const parseNumber = (data: unknown) => {
  const parsed = parseSafe(data)
  return isNumber(parsed) ? parsed : undefined
}

const parseSafe = (text: any) => {
  try {
    return JSON.parse(text) as unknown
  } catch (_) {
    return undefined
  }
}

const isNumber = (data: unknown): data is number =>
  typeof data === 'number' && !Number.isNaN(data) && Number.isFinite(data)

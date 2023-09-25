import AsyncStorage from '@react-native-async-storage/async-storage'
import {Swap, BaseStorage} from '@yoroi/types'

const initialDeps = {storage: AsyncStorage} as const

export function swapStorageMaker(
  deps: {storage: BaseStorage | typeof AsyncStorage} = initialDeps,
): Readonly<Swap.Storage> {
  const {storage} = deps

  const slippage: Readonly<Swap.Storage['slippage']> = {
    save: (newSlippage) =>
      storage.setItem(swapStorageSlippageKey, JSON.stringify(newSlippage)),
    read: () =>
      storage
        .getItem(swapStorageSlippageKey)
        .then((value) => parseNumber(value) ?? 0),
    remove: () => storage.removeItem(swapStorageSlippageKey),
    key: swapStorageSlippageKey,
  } as const

  const clear = async () => {
    await Promise.all([storage.removeItem(swapStorageSlippageKey)])
  }

  return {
    slippage,
    clear,
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

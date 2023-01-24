/* eslint-disable @typescript-eslint/no-explicit-any */
import {BigNumber} from 'bignumber.js'
import ExtendableError from 'es6-error'

import {CONFIG, getCardanoDefaultAsset} from '../../legacy/config'
import {isHaskellShelleyNetwork} from '../../legacy/networks'
import {Token} from '../types'

export class InvalidAssetAmount extends ExtendableError {
  static ERROR_CODES = {
    // general parsing problem or amount is equal to 0
    INVALID_AMOUNT: 'INVALID_AMOUNT',
    TOO_MANY_DECIMAL_PLACES: 'TOO_MANY_DECIMAL_PLACES',
    TOO_LARGE: 'TOO_LARGE',
    TOO_LOW: 'TOO_LOW',
    LT_MIN_UTXO: 'LT_MIN_UTXO',
    // amount is less than min utxo value allowed
    NEGATIVE: 'NEGATIVE',
  }

  constructor(errorCode: typeof InvalidAssetAmount.ERROR_CODES[keyof typeof InvalidAssetAmount.ERROR_CODES]) {
    super('InvalidAssetAmount')
    ;(this as any).errorCode = errorCode
  }
}

// expects an amount in regular currency units (eg ADA, not Lovelace)
export const parseAmountDecimal = (amount: string, token: Token): BigNumber => {
  const assetMeta = token ?? getCardanoDefaultAsset()
  const numberOfDecimals: number = assetMeta.metadata.numberOfDecimals
  const normalizationFactor = Math.pow(10, numberOfDecimals)
  const parsed = new BigNumber(amount, 10)

  if (parsed.isNaN()) {
    throw new InvalidAssetAmount(InvalidAssetAmount.ERROR_CODES.INVALID_AMOUNT)
  }

  if (parsed.decimalPlaces() > numberOfDecimals) {
    throw new InvalidAssetAmount(InvalidAssetAmount.ERROR_CODES.TOO_MANY_DECIMAL_PLACES)
  }

  const value = parsed.times(normalizationFactor)

  if (isHaskellShelleyNetwork(assetMeta.networkId) && assetMeta.isDefault) {
    // ...this is ADA or tADA
    const minValue = CONFIG.NETWORKS.HASKELL_SHELLEY.MINIMUM_UTXO_VAL

    if (value.lt(minValue)) {
      throw new InvalidAssetAmount(InvalidAssetAmount.ERROR_CODES.LT_MIN_UTXO)
    }
  }

  if (value.lt(1)) {
    throw new InvalidAssetAmount(InvalidAssetAmount.ERROR_CODES.TOO_LOW)
  }

  if (value.lt(0)) {
    throw new InvalidAssetAmount(InvalidAssetAmount.ERROR_CODES.NEGATIVE)
  }

  if (value.eq(0)) {
    throw new InvalidAssetAmount(InvalidAssetAmount.ERROR_CODES.INVALID_AMOUNT)
  }

  return value
}

export const parseBoolean = (data: unknown) => {
  const parsed = parseSafe(data)
  return isBoolean(parsed) ? parsed : undefined
}

export const asciiToHex = (text: string) => {
  try {
    return Buffer.from(text, 'utf-8').toString('hex')
  } catch (e) {
    return ''
  }
}

export const isObject = (data: unknown): data is object => {
  return typeof data === 'object' && data !== null && !Array.isArray(data)
}

export const hasProperties = <T extends object, K extends string>(
  obj: T,
  keys: K[],
): obj is T & {[J in K]: unknown} => {
  return !!obj && keys.every((key) => Object.prototype.hasOwnProperty.call(obj, key))
}

export const parseSafe = (text: any) => {
  try {
    return JSON.parse(text)
  } catch (_) {
    return undefined
  }
}

export const isBoolean = (data: unknown): data is boolean => typeof data === 'boolean'

// @flow

import {BigNumber} from 'bignumber.js'
import ExtendableError from 'es6-error'

import {getCardanoDefaultAsset} from '../config/config'
import type {Token} from '../types/HistoryTransaction'

export class InvalidAssetAmount extends ExtendableError {
  static ERROR_CODES = {
    // general parsing problem or amount is equal to 0
    INVALID_AMOUNT: 'INVALID_AMOUNT',
    TOO_MANY_DECIMAL_PLACES: 'TOO_MANY_DECIMAL_PLACES',
    TOO_LARGE: 'TOO_LARGE',
    TOO_LOW: 'TOO_LOW',
    NEGATIVE: 'NEGATIVE',
  }

  constructor(errorCode: $Values<typeof InvalidAssetAmount.ERROR_CODES>) {
    super('InvalidAssetAmount')
    this.errorCode = errorCode
  }
}

// expects an amount in regular currency units (eg ADA, not Lovelace)
export const parseAmountDecimal = (amount: string, token: Token): BigNumber => {
  const assetMeta = token ?? getCardanoDefaultAsset()

  // note: maxSupply can be null
  const maxSupply = assetMeta.metadata.maxSupply != null ? new BigNumber(assetMeta.metadata.maxSupply, 10) : null
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

  if (maxSupply != null && value.gte(maxSupply)) {
    throw new InvalidAssetAmount(InvalidAssetAmount.ERROR_CODES.TOO_LARGE)
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

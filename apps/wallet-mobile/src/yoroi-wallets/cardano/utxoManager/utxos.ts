import {first} from '@yoroi/common'
import BigNumber from 'bignumber.js'

import {RawUtxo} from '../../types'
import {asQuantity} from '../../utils'
import {CollateralConfig} from './types'

export const collateralConfig: CollateralConfig = {
  minLovelace: asQuantity(2_000_000),
  maxLovelace: asQuantity(5_000_000),
}

export function isPureUtxo(utxo: RawUtxo) {
  return utxo.assets.length === 0
}

export const hasValue = (utxo: RawUtxo) => {
  return new BigNumber(asQuantity(utxo.amount)).gte(0)
}

export function isAmountInCollateralRange(amount: RawUtxo['amount'], {maxLovelace, minLovelace}: CollateralConfig) {
  const value = new BigNumber(asQuantity(amount))
  const min = new BigNumber(minLovelace)
  const max = new BigNumber(maxLovelace)
  return value.gte(min) && value.lte(max)
}

export const findCollateralCandidates = (
  utxos: ReadonlyArray<RawUtxo>,
  {maxLovelace, minLovelace}: CollateralConfig,
) => {
  return utxos
    .filter(isPureUtxo)
    .filter(hasValue)
    .filter((utxo) => isAmountInCollateralRange(utxo.amount, {maxLovelace, minLovelace}))
    .sort((a, b) => new BigNumber(asQuantity(a.amount)).comparedTo(asQuantity(b.amount)))
}

export function utxosMaker(
  utxos: ReadonlyArray<RawUtxo>,
  {maxLovelace, minLovelace}: CollateralConfig = collateralConfig,
) {
  const findById = (id: RawUtxo['utxo_id']) => {
    return utxos.find((utxo) => utxo.utxo_id === id)
  }
  const exists = (id: RawUtxo['utxo_id']) => {
    return findById(id) !== undefined
  }

  const drawnCollateral = () => {
    const candidates = findCollateralCandidates(utxos, {maxLovelace, minLovelace})
    const collateral = candidates.find(first)
    return collateral?.utxo_id
  }

  return {
    findById,
    isAmountInCollateralRange,
    findCollateralCandidates: () => findCollateralCandidates(utxos, {maxLovelace, minLovelace}),
    drawnCollateral,
    exists,
  } as const
}

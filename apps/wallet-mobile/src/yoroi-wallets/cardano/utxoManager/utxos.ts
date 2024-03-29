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
export function isAmountInCollateralRange(amount: RawUtxo['amount'], {maxLovelace, minLovelace}: CollateralConfig) {
  const value = new BigNumber(asQuantity(amount))
  const min = new BigNumber(minLovelace)
  const max = new BigNumber(maxLovelace)
  return value.gte(min) && value.lte(max)
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

  const findCollateralCandidates = () => {
    return utxos
      .filter(isPureUtxo)
      .filter((utxo) => isAmountInCollateralRange(utxo.amount, {maxLovelace, minLovelace}))
      .sort((a, b) => new BigNumber(asQuantity(a.amount)).comparedTo(asQuantity(b.amount)))
  }
  const drawnCollateral = () => {
    const candidates = findCollateralCandidates()
    const collateral = candidates.find(first)
    return collateral?.utxo_id
  }

  return {
    findById,
    isAmountInCollateralRange,
    findCollateralCandidates,
    drawnCollateral,
    exists,
  } as const
}

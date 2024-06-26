import {splitBigInt} from '@yoroi/common'
import * as React from 'react'

import {useCurrencyPairing} from '../../Settings/Currency'

type Props = {
  quantity: bigint
  decimals: number
  previousQuantity?: bigint
}

export const useQuantityChange = ({
  quantity,
  previousQuantity,
  decimals,
}: Props): {
  quantityChange?: bigint
  quantityChangePercent: string
  pairedBalanceChange: string
  variantPnl: 'neutral' | 'success' | 'danger'
} => {
  const price = useCurrencyPairing().adaPrice.price

  const quantityChange = React.useMemo(() => {
    if (previousQuantity === undefined) return undefined
    return quantity - previousQuantity
  }, [previousQuantity, quantity])

  const quantityChangePercent = React.useMemo(() => {
    if (quantityChange === undefined || previousQuantity === undefined || Number(previousQuantity) === 0) return '0.00'
    return ((Number(quantityChange) / Number(previousQuantity)) * 100).toFixed(2)
  }, [previousQuantity, quantityChange])

  const variantPnl = React.useMemo(() => {
    if (quantityChange === undefined || price === undefined || Number(quantityChange) === 0) return 'neutral'
    return quantityChange > 0 ? 'success' : 'danger'
  }, [quantityChange, price])

  const pairedBalanceChange = React.useMemo(() => {
    if (quantityChange === undefined || price === undefined) return '0.00'
    return splitBigInt(quantityChange, decimals).bn.times(price).toFormat(2)
  }, [decimals, quantityChange, price])

  return {
    quantityChange,
    quantityChangePercent,
    pairedBalanceChange,
    variantPnl,
  }
}

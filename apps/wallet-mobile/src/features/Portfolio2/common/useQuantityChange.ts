import * as React from 'react'
type Props = {
  quantity: bigint
  previousQuantity?: bigint
};

export const useQuantityChange = ({ quantity, previousQuantity }: Props): {
  quantityChange?: bigint
    quantityChangePercent: string
    variantPnl: 'neutral' | 'success' | 'danger',
} => {
  const quantityChange = React.useMemo(() => {
    if (previousQuantity === undefined) return undefined
    return quantity - previousQuantity
  }, [previousQuantity, quantity])

  const quantityChangePercent = React.useMemo(() => {
    if (quantityChange === undefined || previousQuantity === undefined || Number(previousQuantity) === 0) return '0.00'
    return ((Number(quantityChange) / Number(previousQuantity)) * 100).toFixed(2)
  }, [previousQuantity, quantityChange])

  const variantPnl = React.useMemo(() => {
    if (quantityChange === undefined) return 'neutral'
    return quantityChange >= 0 ? 'success' : 'danger'
  }, [quantityChange])

  return {
    quantityChange,
    quantityChangePercent,
    variantPnl,
  }
};
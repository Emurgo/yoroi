type Return = {
  difference: string
  change: string
  variantPnl: 'danger' | 'success' | 'neutral'
}

export const priceDifference = (previous: number, current: number): Return => {
  if (previous === 0)
    return {
      difference: '0.00',
      change: '0.00',
      variantPnl: 'neutral',
    }
  const difference = current - previous
  const change = (100 * difference) / previous
  const variantPnl = difference < 0 ? 'danger' : difference > 0 ? 'success' : 'neutral'

  return {difference: Number(difference).toFixed(2), change: Number(change).toFixed(2), variantPnl}
}

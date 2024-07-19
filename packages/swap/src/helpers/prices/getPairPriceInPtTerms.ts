import {Portfolio, Swap} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'

export const getPairPriceInPtTerms = ({
  sell,
  buy,
  pool,
}: {
  sell: Portfolio.Token.Amount
  buy: Portfolio.Token.Amount
  pool: Swap.Pool
}) => {
  const calculatePrice = (dividend: BigNumber, divisor: BigNumber) => {
    return divisor.isZero() ? new BigNumber(0) : dividend.dividedBy(divisor)
  }

  const isSellTokenA = pool.tokenA.tokenId === sell.info.id
  const priceA = new BigNumber(pool.ptPriceTokenA)
  const priceB = new BigNumber(pool.ptPriceTokenB)

  const scale = sell.info.decimals - buy.info.decimals
  const scaleMultiplier = new BigNumber(10).pow(scale)

  const priceAB = isSellTokenA
    ? calculatePrice(priceB, priceA).multipliedBy(scaleMultiplier)
    : calculatePrice(priceA, priceB).dividedBy(scaleMultiplier)

  const priceBA = isSellTokenA
    ? calculatePrice(priceA, priceB).dividedBy(scaleMultiplier)
    : calculatePrice(priceB, priceA).multipliedBy(scaleMultiplier)

  return {
    ptPriceAB: priceAB,
    ptPriceBA: priceBA,
  }
}

import {Balance} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'
export const getPairPriceInPtTerms = ({
  sell,
  amountA,
  decimalsA = 0,
  decimalsB = 0,
  // prices not scaled - visual
  ptPriceTokenA,
  ptPriceTokenB,
  precision,
}: {
  sell: Balance.Amount
  amountA: Balance.Amount
  decimalsA: number
  decimalsB: number
  ptPriceTokenA: string
  ptPriceTokenB: string
  precision?: number
}) => {
  const calculatePrice = (
    dividend: BigNumber,
    divisor: BigNumber,
    scale: number,
  ) => {
    return divisor.isZero()
      ? '0'
      : dividend
          .dividedBy(divisor)
          .toFixed(precision ?? scale, BigNumber.ROUND_DOWN)
  }

  const scaleA = new BigNumber(10).pow(decimalsA)
  const scaleB = new BigNumber(10).pow(decimalsB)

  const isSellTokenA = amountA.tokenId === sell.tokenId
  const priceA = new BigNumber(ptPriceTokenA).multipliedBy(scaleA)
  const priceB = new BigNumber(ptPriceTokenB).multipliedBy(scaleB)

  const ptPriceAB = isSellTokenA
    ? calculatePrice(priceB, priceA, Math.max(decimalsA, decimalsB))
    : calculatePrice(priceA, priceB, Math.max(decimalsA, decimalsB))

  const ptPriceBA = isSellTokenA
    ? calculatePrice(priceA, priceB, Math.max(decimalsA, decimalsB))
    : calculatePrice(priceB, priceA, Math.max(decimalsA, decimalsB))

  return {ptPriceAB, ptPriceBA}
}

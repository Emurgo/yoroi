import {ceilDivision} from '../../../utils/ceilDivision'

export const getQuantityWithSlippage = (quantity: bigint, slippage: number) => {
  const initialQuantity = BigInt(quantity)

  const slippageQuantity = ceilDivision(
    BigInt(Math.floor(10_000 * slippage)) * initialQuantity,
    BigInt(100 * 10_000),
  )

  const adjustedQuantity = initialQuantity - slippageQuantity

  return adjustedQuantity
}

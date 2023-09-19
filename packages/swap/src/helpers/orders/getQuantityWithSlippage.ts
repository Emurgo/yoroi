import {ceilDivision} from '../../utils/ceilDivision'

export const getQuantityWithSlippage = (
  quantity: bigint,
  slippage: bigint,
): bigint => {
  const slippageAmount = ceilDivision(
    BigInt(1000) * slippage * quantity,
    BigInt(100 * 1000),
  )

  return quantity - slippageAmount
}

import {Balance} from '@yoroi/types'
import {ceilDivision} from '../../utils/ceilDivision'
import {asQuantity} from '../../utils/asQuantity'

export const getQuantityWithSlippage = (
  quantity: Balance.Quantity,
  slippage: number,
): Balance.Quantity => {
  const q = BigInt(quantity)
  const slippageAmount = ceilDivision(
    BigInt(1000 * Math.floor(100 * slippage)) * q,
    BigInt(100 * 100 * 1000),
  )

  return asQuantity(`${q - slippageAmount}`)
}

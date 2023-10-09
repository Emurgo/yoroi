import {Balance} from '@yoroi/types'
import {ceilDivision} from '../../../utils/ceilDivision'
import {asQuantity} from '../../../utils/asQuantity'

export const getQuantityWithSlippage = (
  quantity: Balance.Quantity,
  slippage: number,
): Balance.Quantity => {
  const initialQuantity = BigInt(quantity)

  const slippageQuantity = ceilDivision(
    BigInt(Math.floor(10000 * slippage)) * initialQuantity,
    BigInt(100 * 10000),
  )

  const adjustedQuantity = initialQuantity - slippageQuantity

  return asQuantity(adjustedQuantity.toString())
}

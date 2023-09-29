import {Balance} from '@yoroi/types'
import {Quantities} from '../../utils/quantities'
import {asQuantity} from '../../utils/asQuantity'

export const getMuesliswapFrontendFee = (
  adaPrice: string,
  milkInWallet: Balance.Quantity,
  sell: Balance.Amount,
): Balance.Amount => {
  const value = Number(sell.quantity) * Number(adaPrice)
  const variable =
    Number(milkInWallet) > 500
      ? 0.0002 * value
      : Number(milkInWallet) > 100
      ? 0.00025 * value
      : 0.0005 * value

  const fee =
    value > 99 ? asQuantity(1_000_000 + Math.round(variable)) : Quantities.zero

  return {tokenId: '', quantity: fee}
}

import {Balance} from '@yoroi/types'
import {Quantities} from '../../../utils/quantities'
import {ceilDivision} from '../../../utils/ceilDivision'
import {asQuantity} from '../../../utils/asQuantity'

export const getLiquidityProviderFee = (
  poolFee: string,
  sell: Balance.Amount,
): Balance.Amount => {
  const providerFee = Quantities.isZero(sell.quantity)
    ? Quantities.zero
    : asQuantity(
        ceilDivision(
          BigInt(Math.floor(Number(poolFee) * 1000)) * BigInt(sell.quantity),
          100n * 1000n,
        ).toString(),
      )

  return {tokenId: sell.tokenId, quantity: providerFee}
}

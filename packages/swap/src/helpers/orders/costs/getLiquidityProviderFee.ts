import {Portfolio} from '@yoroi/types'
import {ceilDivision} from '../../../utils/ceilDivision'

export const getLiquidityProviderFee = (
  poolFee: string,
  sell: Portfolio.Token.Amount,
): Portfolio.Token.Amount => {
  const providerFee =
    sell.quantity === 0n
      ? 0n
      : ceilDivision(
          BigInt(Math.floor(Number(poolFee) * 1000)) * BigInt(sell.quantity),
          100n * 1000n,
        )

  return {info: sell.info, quantity: providerFee}
}

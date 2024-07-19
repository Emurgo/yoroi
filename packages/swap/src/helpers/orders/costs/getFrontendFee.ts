import {App, Portfolio} from '@yoroi/types'
import BigNumber from 'bignumber.js'

/**
 * Calculates the frontend fee and selects a discount tier for a swap transaction.
 *
 * @param lpTokenHeld - The amount of LP (liquidity provider) token, is used to calc discount tier.
 * @param primaryTokenId - The ID of the primary token, available in the manager.
 * @param ptAmount - The value of the sell amount in terms of the primary token.
 * @param feeTiers - An array of discount feeTiers for lp token holders. Defaults to milkHoldersDiscountTiers.
 *
 * @returns An object containing the frontend fee and the selected discount tier.
 */
export const getFrontendFee = ({
  lpTokenHeld,
  ptAmount,
  feeTiers,
}: {
  lpTokenHeld?: Portfolio.Token.Amount
  feeTiers: ReadonlyArray<App.FrontendFeeTier>
  ptAmount: Portfolio.Token.Amount
}): Readonly<{
  fee: Portfolio.Token.Amount
  discountTier: App.FrontendFeeTier | undefined
}> => {
  // identify the discount
  const discountTier = feeTiers.find(
    (tier) =>
      (lpTokenHeld?.quantity ?? 0n) >=
        BigInt(tier.secondaryTokenBalanceThreshold) &&
      ptAmount.quantity >= BigInt(tier.primaryTokenValueThreshold),
  )

  // calculate the fee
  const fee = BigInt(
    new BigNumber(ptAmount.quantity.toString())
      .times(discountTier?.variableFeeMultiplier ?? 0)
      .plus(discountTier?.fixedFee ?? 0)
      .integerValue(BigNumber.ROUND_CEIL)
      .toString(),
  )

  return {
    fee: {info: ptAmount.info, quantity: fee},
    discountTier,
  } as const
}

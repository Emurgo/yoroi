import {Balance} from '@yoroi/types'
import BigNumber from 'bignumber.js'

import {Quantities} from '../../../utils/quantities'
import {
  SwapDiscountTier,
  milkHoldersDiscountTiers,
} from '../../../translators/constants'
import {asQuantity} from '../../../utils/asQuantity'

/**
 * Calculates the frontend fee and selects a discount tier for a swap transaction.
 *
 * @param sell - The amount of tokens being sold.
 * @param buy - The amount of tokens being bought.
 * @param lpTokenHeld - The amount of LP (liquidity provider) token, is used to calc discount tier.
 * @param primaryTokenId - The ID of the primary token, available in the manager.
 * @param sellInPrimaryTokenValue - The value of the sell amount in terms of the primary token.
 * @param buyInPrimaryTokenValue - The value of the buy amount in terms of the primary token.
 * @param discountTiers - An array of discount tiers for lp token holders. Defaults to milkHoldersDiscountTiers.
 *
 * @returns An object containing the frontend fee and the selected discount tier.
 */
export const getFrontendFee = ({
  lpTokenHeld,
  primaryTokenId,
  sellInPrimaryTokenValue,
  discountTiers = milkHoldersDiscountTiers,
}: {
  primaryTokenId: Balance.TokenInfo['id']
  lpTokenHeld?: Balance.Amount
  discountTiers?: ReadonlyArray<SwapDiscountTier>
  sellInPrimaryTokenValue: Balance.Amount
}): Readonly<{
  fee: Balance.Amount
  discountTier: SwapDiscountTier | undefined
}> => {
  // identify the discount
  const discountTier = discountTiers.find(
    (tier) =>
      Quantities.isGreaterThanOrEqualTo(
        lpTokenHeld?.quantity ?? Quantities.zero,
        tier.secondaryTokenBalanceThreshold,
      ) &&
      Quantities.isGreaterThanOrEqualTo(
        sellInPrimaryTokenValue.quantity,
        tier.primaryTokenValueThreshold,
      ),
  )

  // calculate the fee
  const fee = asQuantity(
    new BigNumber(sellInPrimaryTokenValue.quantity)
      .times(discountTier?.variableFeeMultiplier ?? 0)
      .integerValue(BigNumber.ROUND_CEIL)
      .plus(discountTier?.fixedFee ?? 0),
  )

  return {
    fee: {tokenId: primaryTokenId, quantity: fee},
    discountTier,
  } as const
}

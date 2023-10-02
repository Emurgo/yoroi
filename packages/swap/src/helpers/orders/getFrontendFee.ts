import {Balance} from '@yoroi/types'
import BigNumber from 'bignumber.js'

import {Quantities} from '../../utils/quantities'
import {
  SwapDiscountTier,
  milkHoldersDiscountTiers,
} from '../../translators/constants'
import {asQuantity} from '../../utils/asQuantity'

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
  sell,
  buy,
  lpTokenHeld,
  primaryTokenId,
  sellInPrimaryTokenValue,
  buyInPrimaryTokenValue,
  discountTiers = milkHoldersDiscountTiers,
}: {
  sell: Balance.Amount
  buy: Balance.Amount
  primaryTokenId: Balance.TokenInfo['id']
  lpTokenHeld?: Balance.Amount
  discountTiers?: ReadonlyArray<SwapDiscountTier>
  // not implemented yet (for now only ffee is added only if ADA is one of the pair)
  sellInPrimaryTokenValue?: Balance.Amount
  buyInPrimaryTokenValue?: Balance.Amount
}): Readonly<{
  fee: Balance.Amount
  discountTier: SwapDiscountTier | undefined
}> => {
  // discover trade value in ADA (sell/buy/max by pairing)
  // it should range around 50/50
  const maxPrimaryValueSellBuy = Quantities.max(
    sellInPrimaryTokenValue?.quantity ?? Quantities.zero,
    buyInPrimaryTokenValue?.quantity ?? Quantities.zero,
  )
  let primaryTokenBiggerPairValue: Balance.Quantity
  if (sell.tokenId === primaryTokenId) {
    primaryTokenBiggerPairValue = sell.quantity
  } else if (buy.tokenId === primaryTokenId) {
    primaryTokenBiggerPairValue = buy.quantity
  } else {
    primaryTokenBiggerPairValue = maxPrimaryValueSellBuy
  }

  // identify the discount
  const discountTier = discountTiers.find(
    (tier) =>
      Quantities.isGreaterThanOrEqualTo(
        lpTokenHeld?.quantity ?? Quantities.zero,
        tier.secondaryTokenBalanceThreshold,
      ) &&
      Quantities.isGreaterThanOrEqualTo(
        primaryTokenBiggerPairValue,
        tier.primaryTokenValueThreshold,
      ),
  )

  // calculate the fee
  const fee = asQuantity(
    new BigNumber(primaryTokenBiggerPairValue)
      .times(discountTier?.variableFeeMultiplier ?? 0)
      .integerValue(BigNumber.ROUND_UP)
      .plus(discountTier?.fixedFee ?? 0),
  )

  return {
    fee: {tokenId: primaryTokenId, quantity: fee},
    discountTier,
  } as const
}

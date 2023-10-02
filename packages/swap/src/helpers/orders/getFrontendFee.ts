import {Balance} from '@yoroi/types'
import BigNumber from 'bignumber.js'

import {Quantities} from '../../utils/quantities'
import {
  SwapDiscountTier,
  milkHoldersDiscountTiers,
} from '../../translators/constants'
import {asQuantity} from '../../utils/asQuantity'

export const getFrontendFee = ({
  sellAmount,
  buyAmount,
  milkBalance,
  primaryTokenInfo,
  sellInPrimaryTokenValue,
  buyInPrimaryTokenValue,
  discountTiers = milkHoldersDiscountTiers,
}: {
  sellAmount: Balance.Amount
  buyAmount: Balance.Amount
  milkBalance: Balance.Quantity
  primaryTokenInfo: Balance.TokenInfo
  discountTiers?: ReadonlyArray<SwapDiscountTier>
  // not implemented yet (for now only ffee is added only if ADA is one of the pair)
  sellInPrimaryTokenValue?: Balance.Amount
  buyInPrimaryTokenValue?: Balance.Amount
}): Readonly<{
  frontendFee: Balance.Amount
  discountTier: SwapDiscountTier | undefined
}> => {
  // discover trade value in ADA (sell/buy/max by pairing)
  // it should range around 50/50
  const maxPrimaryValueSellBuy = Quantities.max(
    sellInPrimaryTokenValue?.quantity ?? Quantities.zero,
    buyInPrimaryTokenValue?.quantity ?? Quantities.zero,
  )
  let primaryTokenBiggerPairValue: Balance.Quantity
  if (sellAmount.tokenId === primaryTokenInfo.id) {
    primaryTokenBiggerPairValue = sellAmount.quantity
  } else if (buyAmount.tokenId === primaryTokenInfo.id) {
    primaryTokenBiggerPairValue = buyAmount.quantity
  } else {
    primaryTokenBiggerPairValue = maxPrimaryValueSellBuy
  }

  // identify the discount
  const discountTier = discountTiers.find(
    (tier) =>
      Quantities.isGreaterThanOrEqualTo(
        milkBalance,
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
    frontendFee: {tokenId: primaryTokenInfo.id, quantity: fee},
    discountTier,
  } as const
}

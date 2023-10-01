import {Balance} from '@yoroi/types'
import BigNumber from 'bignumber.js'

import {Quantities} from '../../utils/quantities'
import {
  DiscountTier,
  milkHoldersDiscountTiers,
} from '../../translators/constants'
import {asQuantity} from '../../utils/asQuantity'

export const getFrontendFee = ({
  sellAmount,
  buyAmount,
  milkBalance,
  sellInPrimaryTokenValue,
  buyInPrimaryTokenValue,
  primaryTokenInfo,
  discountTiers = milkHoldersDiscountTiers,
}: {
  sellAmount: Balance.Amount
  buyAmount: Balance.Amount
  milkBalance: Balance.Quantity
  sellInPrimaryTokenValue: Balance.Amount
  buyInPrimaryTokenValue: Balance.Amount
  primaryTokenInfo: Balance.TokenInfo
  discountTiers?: ReadonlyArray<DiscountTier>
}): Balance.Amount => {
  // discover trade value in ADA (sell/buy/max by pairing)
  // it should range around 50/50
  const maxPrimaryValueSellBuy = Quantities.max(
    sellInPrimaryTokenValue.quantity,
    buyInPrimaryTokenValue.quantity,
  )
  const primaryTokenBiggerTradingValue =
    sellAmount.tokenId === primaryTokenInfo.id
      ? sellAmount.quantity
      : buyAmount.tokenId === primaryTokenInfo.id
      ? buyInPrimaryTokenValue.quantity
      : maxPrimaryValueSellBuy

  // identify the discount
  const defaultTier = discountTiers[discountTiers.length - 1] // expects max fee as last record
  const discountTier =
    discountTiers.find(
      (tier) =>
        Quantities.isGreaterThanOrEqualTo(
          milkBalance,
          tier.secondaryTokenBalanceThreshold,
        ) &&
        Quantities.isGreaterThanOrEqualTo(
          primaryTokenBiggerTradingValue,
          tier.primaryTokenValueThreshold,
        ),
    ) ?? defaultTier

  // calculate the fee
  const fee = asQuantity(
    new BigNumber(primaryTokenBiggerTradingValue)
      .times(discountTier?.variableFeeMultiplier ?? 0)
      .integerValue(BigNumber.ROUND_UP)
      .plus(discountTier?.fixedFee ?? 0),
  )

  return {tokenId: primaryTokenInfo.id, quantity: fee}
}

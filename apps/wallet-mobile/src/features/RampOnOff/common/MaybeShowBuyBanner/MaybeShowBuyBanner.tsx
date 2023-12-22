import * as React from 'react'

import {useSelectedWallet} from '../../../../SelectedWallet/Context/SelectedWalletContext'
import {useBalances} from '../../../../yoroi-wallets/hooks'
import {Amounts, asQuantity, Quantities} from '../../../../yoroi-wallets/utils/utils'
import {useResetShowBuyBannerSmall} from '../useResetShowBuyBannerSmall'
import {useShowBuyBannerSmall} from '../useShowBuyBannerSmall'
import {BuyBannerBig} from './BuyBannerBig'
import {BuyBannerSmall} from './BuyBannerSmall'

const minAdaThreshold = asQuantity(5_000_000)

export const MaybeShowBuyBanner = () => {
  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)
  const primaryAmount = Amounts.getAmount(balances, wallet.primaryTokenInfo.id)
  const isInThresholdToBuy = Quantities.isGreaterThan(minAdaThreshold, primaryAmount.quantity)
  const hasZeroPt = Quantities.isZero(primaryAmount.quantity)

  const showSmallBanner = useShowBuyBannerSmall()
  const {resetShowBuyBannerSmall} = useResetShowBuyBannerSmall()

  const isShowSmallBanner = showSmallBanner && isInThresholdToBuy && !hasZeroPt

  const handleOnClose = () => {
    resetShowBuyBannerSmall()
  }

  if (hasZeroPt) return <BuyBannerBig />
  if (isShowSmallBanner) return <BuyBannerSmall onClose={handleOnClose} />

  return null
}

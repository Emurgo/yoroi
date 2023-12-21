import * as React from 'react'

import {useSelectedWallet} from '../../../../SelectedWallet/Context/SelectedWalletContext'
import {useBalances} from '../../../../yoroi-wallets/hooks'
import {Amounts, asQuantity, Quantities} from '../../../../yoroi-wallets/utils/utils'
import {useResetShowBuyBannerSmall} from '../useResetShowBuyBannerSmall'
import {useShowBuyBannerSmall} from '../useShowBuyBannerSmall'
import {ShowBuyBannerBig} from './BuyBannerBig'
import {ShowBuyBannerSmall} from './BuyBannerSmall'

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

  const onCloseSmallBanner = () => {
    resetShowBuyBannerSmall()
  }

  if (hasZeroPt) return <ShowBuyBannerBig />
  if (isShowSmallBanner) return <ShowBuyBannerSmall onClose={onCloseSmallBanner} />

  return null
}

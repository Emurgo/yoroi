import * as React from 'react'

import {useBalances} from '../../../../yoroi-wallets/hooks'
import {Amounts, Quantities} from '../../../../yoroi-wallets/utils/utils'
import {useSelectedWallet} from '../../../AddWallet/common/Context'
import {useResetShowBuyBannerSmall} from '../useResetShowBuyBannerSmall'
import {useShowBuyBannerSmall} from '../useShowBuyBannerSmall'
import {BuyBannerBig} from './BuyBannerBig'
import {BuyBannerSmall} from './BuyBannerSmall'

export const ShowBuyBanner = () => {
  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)
  const primaryAmount = Amounts.getAmount(balances, wallet.primaryTokenInfo.id)
  const hasZeroPt = Quantities.isZero(primaryAmount.quantity)

  const showSmallBanner = useShowBuyBannerSmall()
  const {resetShowBuyBannerSmall} = useResetShowBuyBannerSmall()

  if (hasZeroPt) return <BuyBannerBig />
  if (showSmallBanner) return <BuyBannerSmall onClose={resetShowBuyBannerSmall} />

  return null
}

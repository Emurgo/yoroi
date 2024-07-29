import {Chain} from '@yoroi/types'
import * as React from 'react'

import {useBalances} from '../../../../yoroi-wallets/hooks'
import {Amounts, Quantities} from '../../../../yoroi-wallets/utils/utils'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {useResetShowBuyBannerSmall} from '../useResetShowBuyBannerSmall'
import {useShowBuyBannerSmall} from '../useShowBuyBannerSmall'
import {BuyBannerBig} from './BuyBannerBig'
import {BuyBannerSmall} from './BuyBannerSmall'
import {PreprodFaucetBanner} from './PreprodFaucetBanner'

export const ShowBuyBanner = () => {
  const {wallet} = useSelectedWallet()
  const {
    selected: {network},
  } = useWalletManager()
  const balances = useBalances(wallet)
  const primaryAmount = Amounts.getAmount(balances, wallet.primaryTokenInfo.id)
  const hasZeroPt = Quantities.isZero(primaryAmount.quantity)

  const showSmallBanner = useShowBuyBannerSmall()
  const {resetShowBuyBannerSmall} = useResetShowBuyBannerSmall()

  if (hasZeroPt && network === Chain.Network.Preprod) return <PreprodFaucetBanner />
  if (hasZeroPt) return <BuyBannerBig />
  if (showSmallBanner) return <BuyBannerSmall onClose={resetShowBuyBannerSmall} />

  return null
}

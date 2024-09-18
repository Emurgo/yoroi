import {Chain} from '@yoroi/types'
import _ from 'lodash'
import * as React from 'react'

import {useBalances, useTransactionInfos} from '../../../../yoroi-wallets/hooks'
import {Amounts, Quantities} from '../../../../yoroi-wallets/utils/utils'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {useResetShowBuyBannerSmall} from '../useResetShowBuyBannerSmall'
import {useShowBuyBannerSmall} from '../useShowBuyBannerSmall'
import {BuyBannerBig} from './BuyBannerBig'
import {BuyBannerSmall} from './BuyBannerSmall'
import {PreprodFaucetBanner} from './PreprodFaucetBanner'
import {SanchonetFaucetBanner} from './SanchonetFaucetBanner'

export const ShowBuyBanner = () => {
  const {wallet} = useSelectedWallet()
  const transactionInfos = useTransactionInfos({wallet})
  const {
    selected: {network},
  } = useWalletManager()
  const balances = useBalances(wallet)
  const primaryAmount = Amounts.getAmount(balances, wallet.portfolioPrimaryTokenInfo.id)
  const hasZeroPt = Quantities.isZero(primaryAmount.quantity)
  const hasZeroTx = _.isEmpty(transactionInfos)

  const showSmallBanner = useShowBuyBannerSmall()
  const {resetShowBuyBannerSmall} = useResetShowBuyBannerSmall()

  if (hasZeroPt && hasZeroTx && network === Chain.Network.Preprod) return <PreprodFaucetBanner />
  if (hasZeroPt && hasZeroTx && network === Chain.Network.Sancho) return <SanchonetFaucetBanner />
  if (hasZeroPt && hasZeroTx) return <BuyBannerBig />
  if (showSmallBanner) return <BuyBannerSmall onClose={resetShowBuyBannerSmall} />

  return null
}

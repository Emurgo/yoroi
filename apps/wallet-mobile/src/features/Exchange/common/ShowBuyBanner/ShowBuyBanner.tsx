import {Chain} from '@yoroi/types'
import _ from 'lodash'
import * as React from 'react'
import {View} from 'react-native'

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

  let banner = null
  switch (true) {
    case hasZeroPt && hasZeroTx && network === Chain.Network.Preprod:
      banner = <PreprodFaucetBanner />
      break
    case hasZeroPt && hasZeroTx && network === Chain.Network.Sancho:
      banner = <SanchonetFaucetBanner />
      break
    case hasZeroPt && hasZeroTx:
      banner = <BuyBannerBig />
      break
    case showSmallBanner:
      banner = <BuyBannerSmall onClose={resetShowBuyBannerSmall} />
      break
  }

  return banner ? <View style={{paddingBottom: 18}}>{banner}</View> : null
}

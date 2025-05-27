import {time} from '@yoroi/common'
import {useNotificationManager} from '@yoroi/notifications'
import {Chain} from '@yoroi/types'
import _ from 'lodash'
import * as React from 'react'
import {View} from 'react-native'
import {useQuery} from 'react-query'

import {useBalances, useTransactionInfos} from '../../../../yoroi-wallets/hooks'
import {Amounts, Quantities} from '../../../../yoroi-wallets/utils/utils'
import {BannerIds, showBanner} from '../../../Notifications/common/show-banners'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {useResetShowBuyBannerSmall} from '../useResetShowBuyBannerSmall'
import {useShowBuyBannerSmall} from '../useShowBuyBannerSmall'
import {useStrings} from '../useStrings'
import {BuyBannerBig} from './BuyBannerBig'
import {BuyBannerSmall} from './BuyBannerSmall'
import {PreprodFaucetBanner} from './PreprodFaucetBanner'

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
    case hasZeroPt && hasZeroTx:
      banner = <BuyBannerBig />
      break
    case showSmallBanner:
      banner = <BuyBannerSmall onClose={resetShowBuyBannerSmall} />
      break
  }

  return banner ? <View style={{paddingBottom: 18}}>{banner}</View> : null
}

export const useBuyBannerNotification = () => {
  const {wallet} = useSelectedWallet()
  const manager = useNotificationManager()
  const {
    selected: {network},
  } = useWalletManager()

  const strings = useStrings()

  const balances = useBalances(wallet)
  const primaryAmount = Amounts.getAmount(balances, wallet.portfolioPrimaryTokenInfo.id)
  const hasZeroPt = Quantities.isZero(primaryAmount.quantity)

  useQuery({
    queryKey: ['buyCryptoBanner', wallet?.id, network],
    staleTime: time.oneHour,
    queryFn: () => {
      if (hasZeroPt) {
        if (network === Chain.Network.Preprod) {
          showBanner({
            id: BannerIds.TestAda,
            title: strings.preprodFaucetBannerTitle,
            body: strings.preprodFaucetBannerText,
          })
        } else {
          showBanner({
            id: BannerIds.BuyCrypto,
            title: strings.needMoreCrypto,
            body: strings.ourTrustedPartners,
          })
        }
        return true
      } else {
        manager.events.remove(BannerIds.BuyCrypto)
        manager.events.remove(BannerIds.TestAda)
        return false
      }
    },
  })
}

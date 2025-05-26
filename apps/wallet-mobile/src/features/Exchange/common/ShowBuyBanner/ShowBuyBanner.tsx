import {time} from '@yoroi/common'
import {Chain} from '@yoroi/types'
import _ from 'lodash'
import * as React from 'react'
import {View} from 'react-native'
import {useQuery} from 'react-query'

import {useBalances, useTransactionInfos} from '../../../../yoroi-wallets/hooks'
import {Amounts, Quantities} from '../../../../yoroi-wallets/utils/utils'
import {bannerIds, triggerBanner} from '../../../Notifications/common/banner-triggers'
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
  const strings = useStrings()

  const balances = useBalances(wallet)
  const primaryAmount = Amounts.getAmount(balances, wallet.portfolioPrimaryTokenInfo.id)
  const hasZeroPt = Quantities.isZero(primaryAmount.quantity)

  useQuery({
    queryKey: ['buyBanner', wallet?.id],
    staleTime: time.hours(1),
    queryFn: () => {
      if (hasZeroPt) {
        triggerBanner({
          id: bannerIds.buyCryptoBanner,
          title: strings.needMoreCrypto,
          body: strings.ourTrustedPartners,
        })
        return true
      }
      return false
    },
  })
}

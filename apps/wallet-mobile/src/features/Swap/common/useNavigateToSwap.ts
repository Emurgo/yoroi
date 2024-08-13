import {useNavigation} from '@react-navigation/native'
import {useSwap} from '@yoroi/swap'
import {Chain, Portfolio} from '@yoroi/types'
import React from 'react'

import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {TxHistoryRouteNavigation} from '../../../kernel/navigation'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'
import {useSwapForm} from './SwapFormProvider'

export const useNavigateToSwap = () => {
  const navigateTo = useNavigateTo()

  const {orderData, buyTokenInfoChanged} = useSwap()
  const {resetSwapForm} = useSwapForm()

  const {track} = useMetrics()

  const {
    selected: {network},
  } = useWalletManager()

  const {
    wallet: {portfolioPrimaryTokenInfo},
  } = useSelectedWallet()

  const handleOnSwap = React.useMemo(
    () => (tokenInfo?: Portfolio.Token.Info) => {
      if (network === Chain.Network.Preprod) {
        navigateTo.swapPreprodNotice()
        return
      }

      if (network === Chain.Network.Sancho) {
        navigateTo.swapSanchoNotice()
        return
      }

      resetSwapForm()

      if (tokenInfo) buyTokenInfoChanged(tokenInfo)

      track.swapInitiated({
        from_asset: [
          {asset_name: portfolioPrimaryTokenInfo.name, asset_ticker: portfolioPrimaryTokenInfo.ticker, policy_id: ''},
        ],
        to_asset: [
          {asset_name: tokenInfo?.name ?? '', asset_ticker: tokenInfo?.ticker ?? '', policy_id: tokenInfo?.id ?? ''},
        ],
        order_type: orderData.type,
        slippage_tolerance: orderData.slippage,
      })

      navigateTo.swap()
    },
    [
      buyTokenInfoChanged,
      navigateTo,
      network,
      orderData.slippage,
      orderData.type,
      portfolioPrimaryTokenInfo.name,
      portfolioPrimaryTokenInfo.ticker,
      resetSwapForm,
      track,
    ],
  )

  return {handleOnSwap}
}

const useNavigateTo = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  return {
    swap: () => navigation.navigate('swap-start-swap', {screen: 'token-swap'}),
    swapPreprodNotice: () => navigation.navigate('swap-preprod-notice'),
    swapSanchoNotice: () => navigation.navigate('swap-sancho-notice'),
  }
}

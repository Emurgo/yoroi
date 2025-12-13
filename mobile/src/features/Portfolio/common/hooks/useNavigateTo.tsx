import {isEmptyString} from '@yoroi/cardano-wallet'
import {Chain, Portfolio} from '@yoroi/types'
import {useSelectedNetwork} from '@yoroi/wallet-manager'

import {NavigationProp, useNavigation} from '@react-navigation/native'
import * as React from 'react'

import {useRemoteConfig} from '~/common/hooks/useRemoteConfig'
import {setPendingSwapToken} from '~/features/Notifications/common/tools'
import {useSwap} from '~/features/Swap/common/useSwap'
import {useParams} from '~/kernel/navigation/hooks/useParams'
import {PortfolioRoutes} from '~/kernel/navigation/types'

export const useNavigateTo = () => {
  const navigation = useNavigation<NavigationProp<PortfolioRoutes>>()
  const swapForm = useSwap()
  const {network} = useSelectedNetwork()
  const {config} = useRemoteConfig()
  const tokenOutId = config?.swap?.initialPair?.tokenOut

  return React.useRef({
    tokensList: () => navigation.navigate('portfolio-tokens-list'),
    tokenDetail: (params: PortfolioTokenDetailParams) =>
      navigation.navigate('portfolio-token-details', {id: params.id}),
    nftsList: () =>
      navigation.navigate('portfolio-nfts', {screen: 'nft-gallery'}),
    nftDetails: (id: Portfolio.Token.Id) =>
      navigation.navigate('portfolio-nfts', {
        screen: 'nft-details',
        params: {id},
        initial: true,
      }),
    resetTabAndSend: () => {
      navigation.reset({index: 0, routes: [{name: 'dashboard-portfolio'}]})
      navigation.navigate('history', {screen: 'send-start-tx'})
    },
    resetTabAndSwap: () => {
      navigation.reset({index: 0, routes: [{name: 'dashboard-portfolio'}]})
      navigation.navigate('history', {
        screen: 'swap',
        params: {
          screen: 'main',
        },
      })
    },
    resetTabAndSwapWithRemoteConfig: async () => {
      if (network === Chain.Network.Preprod) {
        navigation.navigate('history', {
          screen: 'swap',
          params: {
            screen: 'preprod-notice',
          },
        })
        return
      }

      swapForm.action({type: 'ResetForm'})

      if (tokenOutId) {
        await setPendingSwapToken(tokenOutId)
      }

      navigation.reset({index: 0, routes: [{name: 'dashboard-portfolio'}]})
      navigation.navigate('history', {
        screen: 'swap',
        params: {
          screen: 'main',
        },
      })
    },
    swap: () =>
      navigation.navigate('history', {
        screen: 'swap',
        params: {
          screen: 'main',
        },
      }),
    swapPreprodNotice: () =>
      navigation.navigate('history', {
        screen: 'swap',
        params: {
          screen: 'preprod-notice',
        },
      }),
    buyAda: () =>
      navigation.navigate('history', {screen: 'exchange-create-order'}),
  } as const).current
}

type PortfolioTokenDetailParams = PortfolioRoutes['portfolio-token-details']

const isPortfolioTokenDetailParams = (
  params?: PortfolioTokenDetailParams | object | undefined,
): params is PortfolioTokenDetailParams => {
  const isValidId = !!params && 'id' in params && !isEmptyString(params.id)

  return isValidId
}

export const usePortfolioTokenDetailParams = () => {
  return useParams<PortfolioTokenDetailParams>(isPortfolioTokenDetailParams)
}

import {NavigationProp, useNavigation} from '@react-navigation/native'
import {Portfolio} from '@yoroi/types'
import * as React from 'react'

import {PortfolioRoutes, useParams} from '../../../../kernel/navigation'
import {isEmptyString} from '../../../../kernel/utils'

export const useNavigateTo = () => {
  const navigation = useNavigation<NavigationProp<PortfolioRoutes>>()

  return React.useRef({
    tokensList: () => navigation.navigate('portfolio-tokens-list'),
    tokenDetail: (params: PortfolioTokenDetailParams) =>
      navigation.navigate('portfolio-token-details', {id: params.id}),
    nftsList: () => navigation.navigate('portfolio-nfts', {screen: 'nft-gallery'}),
    nftDetails: (id: Portfolio.Token.Id) =>
      navigation.navigate('portfolio-nfts', {screen: 'nft-details', params: {id}, initial: false}),
    resetTabAndSend: () => {
      navigation.reset({index: 0, routes: [{name: 'dashboard-portfolio'}]})
      navigation.navigate('history', {screen: 'send-start-tx'})
    },
    resetTabAndSwap: () => {
      navigation.reset({index: 0, routes: [{name: 'dashboard-portfolio'}]})
      navigation.navigate('history', {
        screen: 'swap-start-swap',
        params: {screen: 'token-swap'},
      })
    },
    swap: () =>
      navigation.navigate('history', {
        screen: 'swap-start-swap',
        params: {screen: 'token-swap'},
      }),
    swapPreprodNotice: () =>
      navigation.navigate('history', {
        screen: 'swap-preprod-notice',
      }),
    buyAda: () => navigation.navigate('history', {screen: 'exchange-create-order'}),
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

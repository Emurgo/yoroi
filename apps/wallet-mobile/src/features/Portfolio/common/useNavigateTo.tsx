import {NavigationProp, useNavigation} from '@react-navigation/native'
import * as React from 'react'

import {Portfolio2Routes, useParams} from '../../../kernel/navigation'
import {isEmptyString} from '../../../kernel/utils'

export const useNavigateTo = () => {
  const navigation = useNavigation<NavigationProp<Portfolio2Routes>>()

  return React.useRef({
    tokensList: () => navigation.navigate('portfolio-tokens-list'),
    tokenDetail: (params: PortfolioTokenDetailParams) =>
      navigation.navigate('portfolio-token-details', {id: params.id}),
    nftsList: () => navigation.navigate('nfts'),
    send: () => navigation.navigate('history', {screen: 'send-start-tx'}),
    swap: () => navigation.navigate('history', {screen: 'swap-start-swap', params: {screen: 'token-swap'}}),
  } as const).current
}

export type PortfolioTokenDetailParams = Portfolio2Routes['portfolio-token-details']

export const isPortfolioTokenDetailParams = (
  params?: PortfolioTokenDetailParams | object | undefined,
): params is PortfolioTokenDetailParams => {
  const isValidId = !!params && 'id' in params && !isEmptyString(params.id)

  return isValidId
}

export const usePortfolioTokenDetailParams = () => {
  return useParams<PortfolioTokenDetailParams>(isPortfolioTokenDetailParams)
}

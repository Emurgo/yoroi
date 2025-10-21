import {ClaimProvider, claimManagerMaker} from '@yoroi/claim'
import {
  ExchangeProvider,
  exchangeApiMaker,
  exchangeManagerMaker,
} from '@yoroi/exchange'
import {
  ResolverProvider,
  resolverApiMaker,
  resolverManagerMaker,
  resolverStorageMaker,
} from '@yoroi/resolver'
import {App, Resolver} from '@yoroi/types'

import * as React from 'react'

import {unstoppableApiKey} from '~/kernel/constants'

import {useSelectedNetwork} from '../../hooks/useSelectedNetwork'
import {useSelectedWallet} from '../../hooks/useSelectedWallet'

export const WithWalletOpened = ({children}: React.PropsWithChildren) => {
  const {wallet} = useSelectedWallet()
  const claimManager = React.useMemo(() => {
    const address = wallet.externalAddresses[0]
    if (!address) throw new App.Errors.InvalidState('Missing external address')

    return claimManagerMaker({
      address,
      primaryTokenInfo: wallet.portfolioPrimaryTokenInfo,
      tokenManager: wallet.networkManager.tokenManager,
    })
  }, [
    wallet.externalAddresses,
    wallet.portfolioPrimaryTokenInfo,
    wallet.networkManager.tokenManager,
  ])

  return (
    <NetworkWrapper>
      <ClaimProvider manager={claimManager}>{children}</ClaimProvider>
    </NetworkWrapper>
  )
}

const NetworkWrapper = ({children}: React.PropsWithChildren) => {
  const {
    networkManager: {isMainnet},
  } = useSelectedNetwork()
  const resolverStorage = React.useMemo(() => {
    return resolverStorageMaker()
  }, [])

  const resolverApi = React.useMemo(() => {
    return resolverApiMaker({
      apiConfig: {
        [Resolver.NameServer.Unstoppable]: {
          apiKey: unstoppableApiKey,
        },
      },
      cslFactory: () => require('@emurgo/cross-csl-core'),
      isMainnet,
    })
  }, [isMainnet])

  const resolverManager = React.useMemo(() => {
    return resolverManagerMaker(resolverStorage, resolverApi)
  }, [resolverStorage, resolverApi])

  const exchangeManager = React.useMemo(() => {
    const api = exchangeApiMaker({
      isProduction: isMainnet,
      partner: 'yoroi',
    })
    return exchangeManagerMaker({api})
  }, [isMainnet])

  return (
    <ResolverProvider resolverManager={resolverManager}>
      <ExchangeProvider
        manager={exchangeManager}
        initialState={initialExchangeState}
      >
        {children}
      </ExchangeProvider>
    </ResolverProvider>
  )
}

const initialExchangeState = {
  providerId: 'banxa',
  providerSuggestedByOrderType: {
    buy: 'banxa',
    sell: 'encryptus',
  },
}

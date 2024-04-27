import {mountMMKVStorage, observableStorageMaker} from '@yoroi/common'
import {portfolioApiMaker, portfolioTokenManagerMaker, portfolioTokenStorageMaker} from '@yoroi/portfolio'
import {Chain, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'
import * as React from 'react'

export const usePortfolioTokenManager = ({network}: {network: Chain.SupportedNetworks}) => {
  return React.useMemo(() => buildPortfolioTokenManager({network}), [network])
}

export const buildPortfolioTokenManager = ({network}: {network: Chain.SupportedNetworks}) => {
  const rootStorage = mountMMKVStorage<Portfolio.Token.Id>({path: '/', id: `${network}.token-manager`})
  const appTokenDiscoveryStorage = rootStorage.join('token-discovery/')
  const appTokenInfoStorage = rootStorage.join('token-info/')

  const tokenStorage = portfolioTokenStorageMaker({
    tokenDiscoveryStorage: observableStorageMaker(appTokenDiscoveryStorage),
    tokenInfoStorage: observableStorageMaker(appTokenInfoStorage),
  })
  const api = portfolioApiMaker({
    network,
  })

  const tokenManager = portfolioTokenManagerMaker({
    api,
    storage: tokenStorage,
  })

  tokenManager.hydrate({sourceId: 'initial'})
  return {tokenManager, tokenStorage}
}

export const buildPortfolioTokenManagers = () => {
  const mainnetPortfolioTokenManager = buildPortfolioTokenManager({network: Chain.Network.Mainnet})
  const preprodPortfolioTokenManager = buildPortfolioTokenManager({network: Chain.Network.Preprod})
  const sanchoPortfolioTokenManager = buildPortfolioTokenManager({network: Chain.Network.Sancho})

  mainnetPortfolioTokenManager.tokenManager.hydrate({sourceId: 'initial'})
  preprodPortfolioTokenManager.tokenManager.hydrate({sourceId: 'initial'})
  sanchoPortfolioTokenManager.tokenManager.hydrate({sourceId: 'initial'})

  const tokenManagers: Readonly<{
    [Chain.Network.Mainnet]: Portfolio.Manager.Token
    [Chain.Network.Preprod]: Portfolio.Manager.Token
    [Chain.Network.Sancho]: Portfolio.Manager.Token
  }> = freeze(
    {
      [Chain.Network.Mainnet]: mainnetPortfolioTokenManager.tokenManager,
      [Chain.Network.Preprod]: preprodPortfolioTokenManager.tokenManager,
      [Chain.Network.Sancho]: sanchoPortfolioTokenManager.tokenManager,
    },
    true,
  )

  return tokenManagers
}

import {mountMMKVStorage, observableStorageMaker} from '@yoroi/common'
import {portfolioApiMaker, portfolioTokenManagerMaker, portfolioTokenStorageMaker} from '@yoroi/portfolio'
import {Chain, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

export const buildPortfolioTokenManager = ({network}: {network: Chain.SupportedNetworks}) => {
  const rootStorage = mountMMKVStorage<Portfolio.Token.Id>({path: '/', id: `${network}.token-manager`})
  const appTokenInfoStorage = rootStorage.join('token-info/')

  const tokenStorage = portfolioTokenStorageMaker({
    tokenInfoStorage: observableStorageMaker(appTokenInfoStorage),
  })
  const api = portfolioApiMaker({
    network,
    maxConcurrentRequests: 4,
    maxIdsPerRequest: 80,
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

import {mountMMKVStorage, observableStorageMaker} from '@yoroi/common'
import {portfolioApiMaker, portfolioTokenManagerMaker, portfolioTokenStorageMaker} from '@yoroi/portfolio'
import {Chain, Portfolio} from '@yoroi/types'
import * as React from 'react'

export const usePortfolioTokenManager = ({network}: {network: Chain.Network}) => {
  return React.useMemo(() => {
    const tokenDiscoveryStorageMounted = mountMMKVStorage<Portfolio.Token.Id>({path: `${network}/token-discovery/`})
    const tokenInfoStorageMounted = mountMMKVStorage<Portfolio.Token.Id>({path: `${network}/token-info/`})

    const tokenStorage = portfolioTokenStorageMaker({
      tokenDiscoveryStorage: observableStorageMaker(tokenDiscoveryStorageMounted),
      tokenInfoStorage: observableStorageMaker(tokenInfoStorageMounted),
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
  }, [network])
}

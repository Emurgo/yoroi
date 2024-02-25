import {Chain, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

import {PortfolioApi, PortfolioManager, PortfolioStorage} from './types'

export const portfolioManagerMaker = ({
  network,
  api,
  storage,
}: {
  network: Chain.Network
  api: PortfolioApi
  storage: PortfolioStorage
}): PortfolioManager => {
  const balances = new Map<Portfolio.Token.Id, BigInt>()

  const hydrate = async () => {
    const x = {
      balances,
      network,
      api,
      storage,
    }
    if (x) {
      return Promise.resolve()
    }
  }

  return freeze(
    {
      hydrate,
    },
    true,
  )
}
